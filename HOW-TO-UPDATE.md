# How to update the website

**The one rule: pushing to `master` puts your change live.** Within a minute or two of
pushing, GitHub uploads the site to the club's IONOS hosting automatically.

## Making a change
1. Make the edit (or ask Claude to make it).
2. Check it looks right on your computer.
3. In GitHub Desktop: write a short summary, **Commit to master**, then **Push origin**.
4. Wait a couple of minutes, then refresh the live site.

## Checking the upload worked
On GitHub, open the repository and click the **Actions** tab. The latest run of
**Deploy to IONOS** should have a green tick. A red cross means it failed — GitHub also
emails the person who pushed. Click into the run to see why; the usual cause is a
changed IONOS password (see below).

## Undoing a bad change
In GitHub Desktop, open **History**, right-click the bad commit, choose
**Revert changes in commit**, then **Push origin**. The site goes back to how it was.

## What gets uploaded
Everything the site needs (pages, `assets/`, `images/`, the policy PDFs in `docs/`).
These are deliberately **not** uploaded: `supabase/` (database setup), `.github/`,
`.claude/`, notes like this one (`*.md`), and a few unused leftovers. The list lives in
`.github/workflows/deploy.yml`.

Files deleted from the repo are **not** deleted from the server automatically (a safety
measure). To remove one from the live site, delete it in IONOS's file manager or by SFTP.

## Upload settings (only needed if hosting details change)
In GitHub: repository **Settings → Secrets and variables → Actions**.

| Name | Where | What |
|---|---|---|
| `SFTP_HOST` | Variables tab | IONOS SFTP server, e.g. `access-123456.webspace-host.com` |
| `SFTP_USER` | Variables tab | IONOS SFTP username |
| `SFTP_DIR` | Variables tab | Folder the site lives in on IONOS, e.g. `bpsc-new` |
| `SFTP_PASSWORD` | Secrets tab | IONOS SFTP password (hidden; never put it in a file) |

All four are in IONOS under **Hosting → SFTP & SSH**, apart from the folder name. If
the IONOS SFTP password is changed, update `SFTP_PASSWORD` here too or uploads will fail.
