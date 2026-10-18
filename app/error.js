"use client";

export default function Error({ error, reset }) {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-muted">
        {/MONGODB_URI|ECONNREFUSED|querySrv|ETIMEOUT/i.test(error?.message || "")
          ? "The product database isn't reachable right now."
          : "Please try again in a moment."}
      </p>
      <button onClick={reset} className="btn-primary mt-6">Try again</button>
    </div>
  );
}
