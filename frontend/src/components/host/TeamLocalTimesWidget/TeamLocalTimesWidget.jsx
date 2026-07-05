import { useEffect, useMemo, useState } from "react";

import "./TeamLocalTimesWidget.css";

const WEEKEND_DAYS = new Set(["Sat", "Sun"]);

const getTimeZoneName = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);

  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
};

const getLocalHour = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(date);

  return Number(parts.find((part) => part.type === "hour")?.value ?? 0);
};

const getWorkStatus = (member, date) => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: member.timeZone,
  }).format(date);

  if (WEEKEND_DAYS.has(weekday)) {
    return {
      label: "Weekend",
      tone: "weekend",
    };
  }

  const localHour = getLocalHour(date, member.timeZone);
  const workdayStart = member.workHours?.start ?? 9;
  const workdayEnd = member.workHours?.end ?? 17;

  if (localHour >= workdayStart && localHour < workdayEnd) {
    return {
      label: "Working hours",
      tone: "working",
    };
  }

  return {
    label: "Outside hours",
    tone: "off-hours",
  };
};

const createMemberTimeSnapshot = (member, date) => {
  const localTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: member.timeZone,
  }).format(date);

  const localDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: member.timeZone,
  }).format(date);

  return {
    ...member,
    localTime,
    localDate,
    timeZoneName: getTimeZoneName(date, member.timeZone),
    workStatus: getWorkStatus(member, date),
  };
};

function TeamLocalTimesWidget({ collaborators = [] }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const teamTimes = useMemo(
    () =>
      collaborators.map((member) =>
        createMemberTimeSnapshot(member, currentTime),
      ),
    [collaborators, currentTime],
  );

  return (
    <article className="team-local-times-widget">
      <header className="team-local-times-widget__header">
        <div>
          <p className="team-local-times-widget__eyebrow">
            Collaboration Coverage
          </p>

          <h2 className="team-local-times-widget__title">Team Local Times</h2>
        </div>

        <span className="team-local-times-widget__badge">
          {collaborators.length}{" "}
          {collaborators.length === 1 ? "Collaborator" : "Collaborators"}
        </span>
      </header>

      <p className="team-local-times-widget__description">
        Compare collaborator time zones and identify practical windows for
        reviews, handoffs, and project communication.
      </p>

      <div className="team-local-times-widget__grid">
        {teamTimes.map((member) => (
          <section key={member.id} className="team-local-times-widget__member">
            <header className="team-local-times-widget__member-header">
              <div
                className="team-local-times-widget__avatar"
                aria-hidden="true"
              >
                {member.initials}
              </div>

              <div className="team-local-times-widget__identity">
                <h3>{member.name}</h3>

                <p>{member.role}</p>
              </div>
            </header>

            <div className="team-local-times-widget__clock">
              <strong>{member.localTime}</strong>

              <span>{member.timeZoneName}</span>
            </div>

            <div className="team-local-times-widget__details">
              <span>{member.localDate}</span>

              <span>{member.location}</span>
            </div>

            <footer className="team-local-times-widget__member-footer">
              <span
                className={`team-local-times-widget__availability team-local-times-widget__availability--${member.workStatus.tone}`}
              >
                <span
                  className="team-local-times-widget__availability-dot"
                  aria-hidden="true"
                />

                {member.workStatus.label}
              </span>

              <span className="team-local-times-widget__work-window">
                {member.workHours.start}:00–{member.workHours.end}:00
              </span>
            </footer>
          </section>
        ))}
      </div>

      <footer className="team-local-times-widget__footer">
        <span>
          Work-hour indicators are based on each collaborator’s configured local
          schedule.
        </span>

        <span>Updates every minute</span>
      </footer>
    </article>
  );
}

export default TeamLocalTimesWidget;
