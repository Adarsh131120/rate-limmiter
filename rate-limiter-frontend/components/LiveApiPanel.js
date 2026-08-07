// 'use client';

// import { useState } from 'react';

// const DEFAULT_URL =
//   process.env.NEXT_PUBLIC_API_URL || "https://rate-limmiter.onrender.com";

// console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

// export default function LiveApiPanel() {
//   const [apiUrl, setApiUrl] = useState(DEFAULT_URL);
//   const [status, setStatus] = useState('idle'); // idle | checking | up | down
//   const [log, setLog] = useState([]);
//   const [busy, setBusy] = useState(false);

//   const check = async () => {
//     setStatus('checking');
//     try {
//       const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(4000) });
//       setStatus(res.ok ? 'up' : 'down');
//     } catch {
//       setStatus('down');
//     }
//   };

//   const send = async () => {
//     setBusy(true);
//     try {
//       const res = await fetch(`${apiUrl}/api/hello`, { signal: AbortSignal.timeout(4000) });
//       const body = await res.json().catch(() => ({}));
//       setLog((prev) =>
//         [
//           {
//             id: Date.now(),
//             status: res.status,
//             limit: res.headers.get('x-ratelimit-limit'),
//             remaining: res.headers.get('x-ratelimit-remaining'),
//             retryAfter: res.headers.get('retry-after'),
//             message: body.message || body.error,
//           },
//           ...prev,
//         ].slice(0, 8)
//       );
//     } catch (err) {
//       setLog((prev) => [{ id: Date.now(), error: err.message }, ...prev].slice(0, 8));
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <section id="live" className="border-b hairline">
//       <div className="mx-auto max-w-6xl px-6 py-20">
//         <p className="eyebrow mb-3">Panel 05 — connect to the real thing</p>
//         <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
//           This isn&rsquo;t just an animation
//         </h2>
//         <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
//           Run the backend locally (<code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">npm start</code>{' '}
//           in the <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">rate-limiter</code> folder,
//           or <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">docker compose up</code> for the
//           Redis path) and hit it directly from this page.
//         </p>

//         <div className="mt-8 panel px-6 py-6">
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//             <input
//               value={apiUrl}
//               onChange={(e) => setApiUrl(e.target.value)}
//               className="flex-1 rounded-sm border hairline bg-panel2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-amber"
//               placeholder="https://rate-limmiter.onrender.com"
//             />
//             <button
//               onClick={check}
//               className="rounded-sm border hairline px-4 py-2 font-mono text-xs text-muted transition hover:border-line2 hover:text-text"
//             >
//               check connection
//             </button>
//             <StatusPill status={status} />
//           </div>

//           <div className="mt-5 flex gap-3">
//             <button
//               onClick={send}
//               disabled={busy}
//               className="flex-1 rounded-sm bg-amber px-5 py-2.5 font-mono text-sm font-medium text-ink transition hover:bg-amber-soft disabled:opacity-50 sm:flex-none"
//             >
//               GET /api/hello →
//             </button>
//           </div>

//           <div className="mt-6 space-y-1.5 border-t hairline pt-5">
//             {log.length === 0 && (
//               <p className="font-mono text-xs text-muted">
//                 no requests yet — point the URL above at a running instance and send one
//               </p>
//             )}
//             {log.map((entry) => (
//               <div key={entry.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
//                 {entry.error ? (
//                   <span className="text-red">error: {entry.error}</span>
//                 ) : (
//                   <>
//                     <span className={entry.status === 200 ? 'text-teal' : 'text-red'}>
//                       {entry.status} {entry.status === 200 ? 'allowed' : 'rejected'}
//                     </span>
//                     <span className="text-muted">limit {entry.limit}</span>
//                     <span className="text-muted">remaining {entry.remaining}</span>
//                     {entry.retryAfter && <span className="text-muted">retry-after {entry.retryAfter}s</span>}
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function StatusPill({ status }) {
//   const map = {
//     idle: { label: 'not checked', cls: 'text-muted' },
//     checking: { label: 'checking…', cls: 'text-amber' },
//     up: { label: 'reachable', cls: 'text-teal' },
//     down: { label: 'unreachable', cls: 'text-red' },
//   };
//   const s = map[status];
//   return <span className={`eyebrow ${s.cls}`}>{s.label}</span>;
// }




'use client';

import { useState } from 'react';

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://rate-limmiter.onrender.com";

console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

export default function LiveApiPanel() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_URL);
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);

  const normalizeUrl = (url) => url.replace(/\/+$/, '');

  const check = async () => {
    setStatus('checking');

    try {
      const baseUrl = normalizeUrl(apiUrl);
      console.log("Checking:", `${baseUrl}/health`);

      const res = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(4000),
      });

      setStatus(res.ok ? 'up' : 'down');
    } catch (err) {
      console.error(err);
      setStatus('down');
    }
  };

  const send = async () => {
    setBusy(true);

    try {
      const baseUrl = normalizeUrl(apiUrl);
      const url = `${baseUrl}/api/hello`;

      console.log("Calling:", url);

      const res = await fetch(url, {
        signal: AbortSignal.timeout(4000),
      });

      console.log("Status:", res.status);

      const body = await res.json().catch(() => ({}));

      console.log("Response:", body);

      setLog((prev) => [
        {
          id: Date.now(),
          status: res.status,
          limit: res.headers.get('x-ratelimit-limit'),
          remaining: res.headers.get('x-ratelimit-remaining'),
          retryAfter: res.headers.get('retry-after'),
          message: body.message || body.error || 'Unknown response',
        },
        ...prev,
      ].slice(0, 8));
    } catch (err) {
      console.error(err);

      setLog((prev) => [
        {
          id: Date.now(),
          error: err.message,
        },
        ...prev,
      ].slice(0, 8));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="live" className="border-b hairline">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow mb-3">Panel 05 — connect to the real thing</p>
        <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          This isn&rsquo;t just an animation
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Run the backend locally (<code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">npm start</code>{' '}
          in the <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">rate-limiter</code> folder,
          or <code className="rounded-sm bg-panel2 px-1 py-0.5 font-mono text-[13px] text-amber">docker compose up</code> for the
          Redis path) and hit it directly from this page.
        </p>

        <div className="mt-8 panel px-6 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 rounded-sm border hairline bg-panel2 px-3 py-2 font-mono text-sm text-text outline-none focus:border-amber"
              placeholder="https://rate-limmiter.onrender.com"
            />
            <button
              onClick={check}
              className="rounded-sm border hairline px-4 py-2 font-mono text-xs text-muted transition hover:border-line2 hover:text-text"
            >
              check connection
            </button>
            <StatusPill status={status} />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={send}
              disabled={busy}
              className="flex-1 rounded-sm bg-amber px-5 py-2.5 font-mono text-sm font-medium text-ink transition hover:bg-amber-soft disabled:opacity-50 sm:flex-none"
            >
              GET /api/hello →
            </button>
          </div>

          <div className="mt-6 space-y-1.5 border-t hairline pt-5">
            {log.length === 0 && (
              <p className="font-mono text-xs text-muted">
                no requests yet — point the URL above at a running instance and send one
              </p>
            )}
            {log.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                {entry.error ? (
                  <span className="text-red">error: {entry.error}</span>
                ) : (
                  <>
                    <span className={entry.status === 200 ? 'text-teal' : 'text-red'}>
                      {entry.status} {entry.status === 200 ? 'allowed' : 'rejected'}
                    </span>
                    <span className="text-muted">limit {entry.limit}</span>
                    <span className="text-muted">remaining {entry.remaining}</span>
                    {entry.retryAfter && <span className="text-muted">retry-after {entry.retryAfter}s</span>}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }) {
  const map = {
    idle: { label: 'not checked', cls: 'text-muted' },
    checking: { label: 'checking…', cls: 'text-amber' },
    up: { label: 'reachable', cls: 'text-teal' },
    down: { label: 'unreachable', cls: 'text-red' },
  };

  const s = map[status];

  return (
    <span className={`eyebrow ${s.cls}`}>
      {s.label}
    </span>
  );
}