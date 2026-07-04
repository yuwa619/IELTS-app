# Clearband manual QA checklist

Run this after every deploy, on desktop **and** a phone. Supabase mode
(production) unless marked mock.

## Core returning-user loop (the success condition)

1. Fresh login: `/login` → magic link → land on `/onboarding` (new user) or
   `/dashboard` (returning user).
2. Complete onboarding (goal, band slider above 7.0, date/format/location,
   time) → Continue saves without error → finish.
3. `/dashboard` greets you by name with your real target and test countdown.

## Today task loop

4. `/today` shows 4 blocks. Tap **Start** on a task — the URL carries `?taskId=`.
5. Complete the activity (see below). The end-of-activity panel shows
   "Today's task marked complete ✓".
6. Return to Today via the panel — the task shows **Done**.
7. `/dashboard` "Today's plan" count and XP updated.

## Writing Task 1 (regression for the timer + dead-end bugs)

8. Timer starts at 20:00 and visibly counts down within a few seconds.
9. Under 5 minutes left the chip turns amber; at 0:00 it reads "Time is up",
   the text is NOT deleted, and submit still works (attempt flagged over-time).
10. Write ≥1 sentence, tick consent, **Submit for feedback**.
11. Estimate card shows band range + 4 criteria + "not an official IELTS
    score" disclaimer + **Saved to your account** (Supabase mode).
12. Below it, the **Writing attempt complete** panel offers: Try another
    prompt / Today's plan / Writing Task 2 / Progress / Review queue.
    No browser-back needed.
13. Task 2 same flow with a 40:00 timer.

## Other activities end with a next action

14. Reading and Listening: 5-question sets with a progress counter; each
    answer saves; set ends with a completion panel (wrong answers → review
    queue + error log).
15. Speaking: record (or skip on unsupported browsers), save attempt →
    completion panel.
16. Lesson: Mark complete → completion panel with Next lesson.
17. Vocabulary: grade all cards → deck-complete panel.
18. Review queue: grade all due items → session-complete panel. Starting from
    a Today task with an empty queue still completes the task.
19. Mini mock: timer counts, submit → result + saved note + completion panel.
20. Grammar: "Explain rule" expands examples (no dead buttons).

## Persistence + cross-device

21. Reload after a writing attempt — Progress still reflects it.
22. Log out (`Settings → Sign out`), log back in — same progress, no
    re-onboarding.
23. Open on a second device — same XP/streak/attempts.
24. Settings → Data status panel: Supabase mode, signed in, recent
    "last saved activity".

## Mobile layout

25. iPhone-width viewport: every submit/next button reachable; nothing hidden
    behind the bottom tab bar; completion panels fully visible.

## Mock mode (local dev only)

26. Without Supabase env vars: all routes open, activities work, results say
    "Mock mode: not saved to an account".
