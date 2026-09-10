"use client";

import { useActionState } from "react";
import { newsletterAction } from "../app/actions";
import s from "./newsletter.module.css";

export default function Newsletter() {
  const [state, dispatch, isPending] = useActionState(newsletterAction, "idle");

  return (
    <div className={s.newsletter}>
      <h4 className={s.label}>Newsletter</h4>

      {state === "success" ? (
        <p className={s.description}>You&rsquo;re in, we&rsquo;ll keep you updated.</p>
      ) : (
        <>
          <p className={s.description}>
            Signup to occasionally receive new thoughts and product launches:
          </p>
          <form className={s.form} action={dispatch}>
            <input
              className={s.input}
              name="email"
              placeholder="Enter your e-mail"
              required
              type="email"
            />
            <button
              className={s.submit}
              type="submit"
              aria-label="Subscribe"
              disabled={isPending}
            >
              +
            </button>
          </form>
          {state === "error" && (
            <p className={s.description}>An error occurred while sending the form.</p>
          )}
        </>
      )}
    </div>
  );
}
