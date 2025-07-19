# README

# Verify Dev Frontend

## Development Workflow

- Do your development work in your own branch, and create a merge request to the `main` branch when your task is complete. Request a reviewer as part of the merge request.
- Clone the repo: `git clone <repo-url>`
- Navigate to the frontend directory: `cd frontend`
- Create a `.env` file. Ask any developer to securely share it using [croc](https://github.com/schollz/croc) or another secure channel if it involves secret keys.
- Install dependencies: `npm install`
- Start the development server: `npm run dev`

### Working with the backend API

- Follow the instructions in `backend/README.md` to generate the Encore API client.
- Copy the generated client file to `src/lib/api.ts`. Your new API methods will then be available from that client.

### Coding Principles

- Prefer **Server Components** whenever possible.
- Always use translations. Place copy in the `messages/*` folder and access it with `next-intl`; avoid hard-coded strings.
- Use **TanStack Query** for all data fetching. When a component needs data, prefetch the query in a Server Component, dehydrate the state, and hydrate it on the client (see `src/app/assesments/page.tsx`).
- Use **React Hook Form** with Zod for forms and validation.
- Before creating a new UI element, check **shadcn/ui**. If a component exists there, reuse it; otherwise add your own component under `src/components/shared`.
- Minimise custom CSS; use Tailwind utilities wherever possible.
- Persist shared client-side state with **Zustand** if necessary.
- Store common colour tokens in `globals.css` using custom properties such as `--brand-blue-1`.
- Review more in [Best Coding Practices & Contribution Rules](https://www.notion.so/Best-Coding-Practices-Contribution-Rules-22bc4b54f81a8020ab15cfd32f5e4881?source=copy_link) before submitting any code.

### Git History

- Use `git pull --rebase` (or `git rebase main`) instead of merge commits to maintain a clean, linear commit history.
