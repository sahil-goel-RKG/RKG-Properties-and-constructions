import csv
import os
import re


def norm_digits(s: str) -> str:
    return re.sub(r"\D+", "", s or "")


PHONE_RE = re.compile(r"(?:\+?91[\s-]?)?(\d{10})")


def main() -> None:
    inp = os.path.join("public", "excel", "merged_for_sql.csv")
    outp = os.path.join("public", "excel", "merger_for_sql_updated.csv")

    moved_phone_only = 0
    extracted_from_name = 0
    moved_comment_to_remarks = 0

    rows = None
    fieldnames = None
    last_err = None
    for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            with open(inp, "r", newline="", encoding=enc) as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames or []
                rows = list(reader)
            last_err = None
            break
        except UnicodeDecodeError as e:
            last_err = e
            continue

    if rows is None or fieldnames is None:
        raise last_err or SystemExit("Failed to read CSV")

    if not fieldnames:
        raise SystemExit("No header found in CSV")

    for r in rows:
        name = (r.get("Prospect Name") or "").strip()
        num = (r.get("Prospect Number") or "").strip()
        remarks = (r.get("Remarks") or "").strip()

        if not name:
            continue

        # If Prospect Number is empty, try to derive it from Prospect Name.
        if not num:
            digits = norm_digits(name)

            # Case 1: name is basically just a phone number (e.g. "9811988575")
            m = PHONE_RE.search(name)
            if m and (digits == m.group(1) or len(digits) <= 13):
                r["Prospect Number"] = m.group(1)
                r["Prospect Name"] = ""
                moved_phone_only += 1
                continue

            # Case 2: name contains phone + text
            if m:
                r["Prospect Number"] = m.group(1)
                extracted_from_name += 1

                start, end = m.span(0)
                remaining = (name[:start] + " " + name[end:]).strip()
                remaining = re.sub(r"\s+", " ", remaining)

                # If remaining looks like a comment and remarks is empty, move it to remarks
                if remaining and not remarks:
                    r["Remarks"] = remaining
                    moved_comment_to_remarks += 1
                    r["Prospect Name"] = ""
                else:
                    r["Prospect Name"] = remaining

    os.makedirs(os.path.dirname(outp), exist_ok=True)
    with open(outp, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    print("Wrote", outp)
    print("moved_phone_only", moved_phone_only)
    print("extracted_from_name", extracted_from_name)
    print("moved_comment_to_remarks", moved_comment_to_remarks)


if __name__ == "__main__":
    main()

