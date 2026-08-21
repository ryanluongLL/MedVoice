"""
Ingest the CMS PPRRVU (Physician Fee Schedule Relative Value) file into SQLite.
Milestone 1: load code -> RVUs + conversion factor, compute a national
non-facility benchmark price (no geographic GPCI adjustment yet).
"""
import argparse
import sqlite3
import pandas as pd

SKIP_ROWS = 10 # 9 junk/title rows + the messy header row: we name columns ourselves
USECOLS = [0,1,2,3,5,6,8,10,25]
COLNAMES = [
    "hcpcs", "modifier", "description", "status_code",
    "work_rvu", "nonfac_pe_rvu", "fac_pe_rvu", "mp_rvu", "conv_factor",
]

def load(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(
        csv_path, skiprows=SKIP_ROWS, header=None,
        usecols=USECOLS, names=COLNAMES,
        dtype=str, keep_default_na=False,
    )
    # print("DEBUG columns:", df.columns.tolist())
    # print("DEBUG shape:", df.shape)
    # print("DEBUG first row:", df.iloc[0].to_dict())
    df["hcpcs"] = df["hcpcs"].str.strip()
    df = df[df["hcpcs"].str.match(r"^[A-Z0-9]{5}$", na=False)].copy()

    for col in ["work_rvu", "nonfac_pe_rvu", "fac_pe_rvu", "mp_rvu", "conv_factor" ]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    df["modifier"] = df["modifier"].str.strip()
    df["status_code"] = df["status_code"].str.strip()
    df["description"] = df["description"].str.strip()

    df["benchmark_nonfac"] = (
        (df["work_rvu"] + df["nonfac_pe_rvu"] + df["mp_rvu"]) * df["conv_factor"]
    ).round(2)
    return df

def write_sqlite(df: pd.DataFrame, db_path: str):
    conn = sqlite3.connect(db_path)
    df.to_sql("rvu", conn, if_exists="replace", index=False)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_hcpcs ON rvu(hcpcs)")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True)
    ap.add_argument("--db", default="benchmark.db")
    args = ap.parse_args()

    df=load(args.csv)
    write_sqlite(df, args.db)

    active = df[df["status_code"] == "A"]
    print(f"Loaded {len(df)} total codes  |  {len(active)} active (status A)")
    print("\nSample active codes with computed non-facility benchmark:")
    for code in ["99213", "71046", "36415"]:
        row = df[(df["hcpcs"] == code) & (df["modifier"] == "")]
        if not row.empty:
            r = row.iloc[0]
            print(f"  {code}  {r['description'][:32]:32}  "
                  f"work={r['work_rvu']:.2f} pe={r['nonfac_pe_rvu']:.2f} mp={r['mp_rvu']:.2f} "
                  f"CF={r['conv_factor']:.4f}  ->  ${r['benchmark_nonfac']:.2f}")
