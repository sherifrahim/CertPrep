"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearMockSession,
  describeSession,
  loadMockSession,
  type MockSession,
} from "@/lib/mock-session";

/**
 * Shown above the mock exam start screen when an unfinished paper is saved for
 * this exam. Renders nothing on the server or when there is no session.
 */
export function MockResumeBanner({ examId }: { examId: string }) {
  const [session, setSession] = useState<MockSession | null>(null);

  useEffect(() => {
    setSession(loadMockSession(examId));
  }, [examId]);

  if (!session) return null;

  return (
    <div className="card mb-6 border-accent p-5">
      <h2 className="font-semibold">You have an exam in progress</h2>
      <p className="mt-1 text-sm text-muted">
        {describeSession(session)}. The countdown is paused until you resume.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/exams/${examId}/mock?resume=1`} className="btn-primary">
          Resume exam
        </Link>
        <button
          type="button"
          onClick={() => {
            clearMockSession(examId);
            setSession(null);
          }}
          className="btn-secondary"
        >
          Discard it
        </button>
      </div>
    </div>
  );
}
