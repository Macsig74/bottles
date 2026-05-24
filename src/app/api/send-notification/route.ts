import { NextResponse } from "next/server";
import webpush from "web-push";
import {
  getAllSubscriptions,
  removeSubscription,
} from "@/lib/pushSubscriptions";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST() {
  const subscriptions = getAllSubscriptions();

  if (subscriptions.length === 0) {
    return NextResponse.json({ error: "Aucun abonné" }, { status: 400 });
  }

  const payload = JSON.stringify({
    title: "Jai rréussi",
    body: "ca marche",
    url: "/",
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => {
        // Subscription expirée ou invalide → on la supprime
        if (err.statusCode === 410 || err.statusCode === 404) {
          removeSubscription(sub.endpoint);
        }
        throw err;
      }),
    ),
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed });
}
