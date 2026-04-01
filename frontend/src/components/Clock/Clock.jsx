import { useEffect, useState } from "react";

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString();

  const date = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timezone = Intl.DateTimeFormat()
    .resolvedOptions()
    .timeZone.split("/")
    .pop()
    .replace("_", " ");

  return (
    <div className="clock">
      <div className="clock__time">{time}</div>

      <div className="clock__meta">
        <span>{date}</span>
        <span>•</span>
        <span className="clock__tz">{timezone}</span>
      </div>
    </div>
  );
}

export default Clock;
