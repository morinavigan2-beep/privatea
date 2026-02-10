"use client";

import { CheckCircle } from "lucide-react";

export function ThankYou() {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Vielen Dank für Ihr Feedback!
        </h2>
        <p className="text-muted-foreground">
          Ihre Nachricht wurde privat an uns gesendet. Wir schätzen Ihre
          Meinung sehr und werden uns um Ihre Anmerkungen kümmern.
        </p>
      </div>
    </div>
  );
}
