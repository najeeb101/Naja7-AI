# Naja7 AI Contract Analyzer

Naja7 is a portfolio demo for AI-assisted contract review. Visitors can upload a TXT, PDF, or DOCX contract, extract readable text in the browser, save the document to Supabase, generate an AI review, and ask document-specific questions.

This is a scanning and summarization tool for demos. It is not legal advice.

## Tech Stack

- Vite, React, TypeScript
- Tailwind CSS and shadcn-ui
- Supabase Auth, Postgres, RLS, and Edge Functions
- Lovable AI Gateway with `google/gemini-2.5-flash`
- `pdfjs-dist` and `mammoth` for browser document text extraction

## Local Setup

```sh
npm install
npm run dev
```

Create a `.env` file with:

```sh
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Anonymous sign-ins must be enabled in Supabase Auth because the demo has no visible login screen.

## Supabase Setup

Apply the migrations in `supabase/migrations`.

Set Edge Function secrets:

```sh
supabase secrets set LOVABLE_API_KEY=your_lovable_ai_gateway_key
```

Deploy functions:

```sh
supabase functions deploy analyze-document
supabase functions deploy chat-document
```

The functions require JWT verification and use the caller's anonymous session so each visitor can only access their own documents.

## Deployment

Deploy the Vite app to Vercel and add these environment variables:

```sh
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

After deployment, update the portfolio project entry with:

- GitHub: `https://github.com/najeeb101/aixnew`
- Live: your Vercel deployment URL

## Verification

Run:

```sh
npm run build
npm run lint
```

Manual checks:

- TXT, PDF, and DOCX uploads extract readable text.
- Unsupported files and files over 5MB are rejected.
- Empty, scanned, encrypted, or unreadable files show helpful errors.
- Analysis moves through pending, completed, or failed states.
- Chat only works after selecting an analyzed document.
- A different anonymous browser session cannot see the previous session's documents.
