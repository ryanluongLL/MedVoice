"""Look up a CPT/HCPCS code and return its national non-facility benchmark."""
import argparse, sqlite3

def lookup(db_path: str, code: str):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        "SELECT * FROM rvu WHERE hcpcs = ? ORDER BY modifier LIMIT 1",
        (code.upper().strip(),),
    ).fetchone()
    conn.close()
    return dict(row) if row else None

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("code")
    ap.add_argument("--db", default="benchmark.db")
    args = ap.parse_args()

    r = lookup(args.db, args.code)
    if r is None:
        print(f"{args.code}: not found in fee schedule")
    elif r["status_code"] != "A":
       print(f"{args.code} ({r['description']}): status '{r['status_code']}' "
              f"- no Medicare benchmark available for this code")
    else:
        print(f"{args.code} {r['description']}")
        print(f"  Medicare national non-facility benchmark: ${r['benchmark_nonfac']:.2f}")
        