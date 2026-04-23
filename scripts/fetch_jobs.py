"""
SkillSync Job Fetcher — Powered by JobSpy (speedyapply/JobSpy)
Fetches real job listings from Naukri & Indeed India based on BKT-mastered skills.
Saves results to public/jobs-data.json for the Next.js frontend.
"""
import json
import sys
import csv
from datetime import datetime

try:
    from jobspy import scrape_jobs
except ImportError:
    print("ERROR: python-jobspy not installed. Run: pip install python-jobspy")
    sys.exit(1)


def fetch_jobs(skills: list[str], location: str = "India", count: int = 15):
    """Fetch real jobs from Naukri and Indeed based on mastered skills."""
    search_term = " OR ".join(skills)
    print(f"Searching for: {search_term}")
    print(f"Location: {location}")
    print(f"Results wanted: {count}")
    print("-" * 50)

    try:
        jobs_df = scrape_jobs(
            site_name=["indeed", "naukri"],
            search_term=search_term,
            location=location,
            results_wanted=count,
            hours_old=72,
            country_indeed="india",
            verbose=0
        )
    except Exception as e:
        print(f"Error during scraping: {e}")
        # Fallback: try indeed only
        print("Retrying with Indeed only...")
        try:
            jobs_df = scrape_jobs(
                site_name=["indeed"],
                search_term=search_term,
                location=location,
                results_wanted=count,
                hours_old=168,
                country_indeed="india",
                verbose=0
            )
        except Exception as e2:
            print(f"Fallback also failed: {e2}")
            return []

    if jobs_df is None or len(jobs_df) == 0:
        print("No jobs found.")
        return []

    print(f"Found {len(jobs_df)} jobs!")

    job_list = []
    for _, row in jobs_df.iterrows():
        job = {
            "id": str(len(job_list) + 1),
            "title": str(row.get("title", "")) if row.get("title") else "",
            "company": str(row.get("company", "")) if row.get("company") else "",
            "location": str(row.get("location", "")) if row.get("location") else "",
            "salary": "",
            "description": "",
            "job_url": str(row.get("job_url", "")) if row.get("job_url") else "",
            "source": str(row.get("site", "")).upper() if row.get("site") else "UNKNOWN",
            "date_posted": "",
            "job_type": str(row.get("job_type", "")) if row.get("job_type") else "",
            "is_remote": bool(row.get("is_remote", False)),
        }

        # Handle salary
        min_amt = row.get("min_amount")
        max_amt = row.get("max_amount")
        interval = row.get("interval", "")
        if min_amt and max_amt:
            job["salary"] = f"{min_amt:,.0f} - {max_amt:,.0f} ({interval})"
        elif min_amt:
            job["salary"] = f"{min_amt:,.0f}+ ({interval})"
        else:
            job["salary"] = "Not Disclosed"

        # Handle description
        desc = row.get("description", "")
        if desc and isinstance(desc, str):
            job["description"] = desc[:300] + "..." if len(desc) > 300 else desc

        # Handle date
        date_posted = row.get("date_posted")
        if date_posted:
            job["date_posted"] = str(date_posted)

        if job["title"] and job["job_url"]:
            job_list.append(job)

    return job_list


def main():
    # Default skills (simulating BKT mastered skills)
    skills = ["data entry", "excel", "computer operator"]
    location = "India"

    if len(sys.argv) > 1:
        skills = sys.argv[1].split(",")
    if len(sys.argv) > 2:
        location = sys.argv[2]

    print(f"\n{'='*50}")
    print(f"  SkillSync Job Fetcher")
    print(f"  Skills: {skills}")
    print(f"  Location: {location}")
    print(f"{'='*50}\n")

    jobs = fetch_jobs(skills, location, count=20)

    if not jobs:
        print("No jobs found. Creating sample data for demo...")
        # Don't exit — the frontend will handle empty state
        jobs = []

    # Save to public directory for Next.js
    output_path = "public/jobs-data.json"
    output = {
        "fetched_at": datetime.now().isoformat(),
        "skills_searched": skills,
        "location": location,
        "total_results": len(jobs),
        "jobs": jobs
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n Saved {len(jobs)} jobs to {output_path}")

    # Also save CSV for analysis
    if jobs:
        csv_path = "public/jobs-data.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=jobs[0].keys())
            writer.writeheader()
            writer.writerows(jobs)
        print(f" Saved CSV to {csv_path}")


if __name__ == "__main__":
    main()
