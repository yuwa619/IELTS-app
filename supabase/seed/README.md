Seed files should upsert original IELTS-style Clearband content only:

- 10 lessons
- 20 vocabulary items
- 20 grammar items
- Listening and Reading practice questions
- Writing and Speaking prompts
- One mini mock
- Adult-friendly badges

Do not import official IELTS questions, audio, model answers, logos, or marks.

Run:

```bash
npm run seed:supabase
```

The seed script requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
