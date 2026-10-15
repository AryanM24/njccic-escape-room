# Request to allow a classroom website

Copy this into an email to your school's IT or filtering contact. Replace the
parts in [brackets] before sending.

---

**Subject:** Please allow a classroom site for AP Cybersecurity: [site address]

Hello,

I teach AP Cybersecurity and would like to use a short classroom activity called
Protocol: Nightjar on [date]. Students open it in a browser and work in teams through a
fictional incident at a power utility, in one 45 minute period. It covers Units 1 to 3 of
the course framework.

Could you please allow **[site address]** on student devices?

What it is, so you can check it quickly:

- The site describes itself at **[site address]/about**, which is written for teachers and IT staff.
- It is a simulation. The terminal runs nothing real, scans nothing real and connects to no other computer. The scenario, names, addresses and domains are all fictional.
- No accounts, no ads, no analytics, no cookies, and no third-party scripts, fonts or embeds.
- Progress is saved in the browser's local storage on that device only.
- The only network request after the page loads is one HTTPS POST to **[site address]/api/unlock** on the same hostname, which checks a typed answer. It contains the finding number, the answer text and a random anonymous browser id, nothing that identifies the student. The id exists so a class sharing one network address is not throttled as a single user.

What it needs: HTTPS to that one hostname, JavaScript, and local storage. No other domains, WebSockets, downloads or extensions.

If the site shows up in a hacking or security-tools category, it is a false match from the cybersecurity theme. It is an educational activity and can be recategorised as education.

Thank you,
[name], [school]
