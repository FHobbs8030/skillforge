import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./DemoMission.css";

const missionsByRole = {
  host: {
    roleLabel: "Host",
    title: "Rescue the LaunchPad Release",
    summary:
      "The release is approaching, two work sections are blocked, and the team needs clear direction. Organize the project and restore release readiness.",
    completionRank: "Project Coordinator",
    objectives: [
      {
        id: "host-review-overview",
        title: "Review the project overview",
        description:
          "Inspect the current release status and identify the highest-risk area.",
        actionLabel: "Review project",
        xp: 50,
        event:
          "You identified Authentication as the highest-risk release area.",
      },
      {
        id: "host-set-priority",
        title: "Set the release priority",
        description:
          "Mark the mobile authentication validation section as urgent.",
        actionLabel: "Set urgent priority",
        xp: 75,
        event:
          "Mobile authentication validation was marked as an urgent priority.",
      },
      {
        id: "host-assign-work",
        title: "Assign the critical work",
        description:
          "Assign the validation section to the collaborator best positioned to complete it.",
        actionLabel: "Assign to Maya",
        xp: 100,
        event: "Maya was assigned to mobile authentication validation.",
      },
      {
        id: "host-resolve-blocker",
        title: "Respond to a team blocker",
        description:
          "A collaborator needs clarification about the required validation environment.",
        actionLabel: "Resolve blocker",
        xp: 125,
        event: "The validation-environment blocker was resolved for the team.",
      },
      {
        id: "host-review-github",
        title: "Review GitHub activity",
        description:
          "Confirm that the authentication pull request is ready for final review.",
        actionLabel: "Review pull request",
        xp: 150,
        event: "Authentication pull request #48 passed the simulated review.",
      },
      {
        id: "host-approve-release",
        title: "Approve the release milestone",
        description:
          "Confirm that the project has reached release-ready status.",
        actionLabel: "Approve release",
        xp: 200,
        event:
          "LaunchPad reached release-ready status. The milestone was approved.",
      },
    ],
  },

  collaborator: {
    roleLabel: "Collaborator",
    title: "Complete the LaunchPad Release",
    summary:
      "The project needs someone to complete a critical validation section, communicate progress, and help the team reach its release milestone.",
    completionRank: "Release Specialist",
    objectives: [
      {
        id: "collaborator-review-overview",
        title: "Review your project overview",
        description:
          "Understand the release objective, team status, and current priorities.",
        actionLabel: "Review overview",
        xp: 50,
        event:
          "You reviewed the project and identified the active release priority.",
      },
      {
        id: "collaborator-claim-work",
        title: "Claim an available work section",
        description:
          "Take ownership of the mobile authentication validation section.",
        actionLabel: "Claim work section",
        xp: 75,
        event: "You claimed the mobile authentication validation work section.",
      },
      {
        id: "collaborator-update-progress",
        title: "Start the assigned work",
        description:
          "Move the work section into active development and record your progress.",
        actionLabel: "Start active work",
        xp: 100,
        event: "Mobile authentication validation moved into active work.",
      },
      {
        id: "collaborator-communicate",
        title: "Communicate a blocker",
        description:
          "Ask the host which device environment should be used for final validation.",
        actionLabel: "Send blocker message",
        xp: 125,
        event:
          "Your blocker was sent to the host with the required project context.",
      },
      {
        id: "collaborator-review-github",
        title: "Review the linked GitHub activity",
        description:
          "Verify the authentication changes associated with the active work section.",
        actionLabel: "Verify GitHub activity",
        xp: 150,
        event:
          "You verified the simulated authentication changes in pull request #48.",
      },
      {
        id: "collaborator-complete-work",
        title: "Complete the release work",
        description:
          "Submit the final validation result and complete the assigned section.",
        actionLabel: "Complete work section",
        xp: 200,
        event: "Mobile authentication validation was completed and submitted.",
      },
    ],
  },
};

function DemoMission() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [phase, setPhase] = useState("select");
  const [completedObjectiveIds, setCompletedObjectiveIds] = useState([]);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [events, setEvents] = useState([]);

  const mission = selectedRole ? missionsByRole[selectedRole] : null;

  const completedCount = completedObjectiveIds.length;
  const totalObjectives = mission?.objectives.length ?? 0;

  const progressPercent =
    totalObjectives > 0
      ? Math.round((completedCount / totalObjectives) * 100)
      : 0;

  const releaseReadiness = Math.min(96, 42 + completedCount * 9);
  const blockedSections = Math.max(0, 2 - Math.floor(completedCount / 2));

  const currentObjective = useMemo(() => {
    if (!mission) {
      return null;
    }

    return mission.objectives.find(
      (objective) => !completedObjectiveIds.includes(objective.id),
    );
  }, [completedObjectiveIds, mission]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setPhase("briefing");
    setCompletedObjectiveIds([]);
    setExperiencePoints(0);
    setEvents([]);
  };

  const startMission = () => {
    if (!mission) {
      return;
    }

    setEvents([
      {
        id: "mission-start",
        label: "Mission briefing",
        message: `${mission.roleLabel} mission started. LaunchPad release readiness is currently 42%.`,
      },
    ]);

    setPhase("active");
  };

  const completeObjective = (objective) => {
    if (!currentObjective || objective.id !== currentObjective.id) {
      return;
    }

    const nextCompletedObjectiveIds = [...completedObjectiveIds, objective.id];

    setCompletedObjectiveIds(nextCompletedObjectiveIds);

    setExperiencePoints(
      (currentExperiencePoints) => currentExperiencePoints + objective.xp,
    );

    setEvents((currentEvents) => [
      {
        id: `${objective.id}-${Date.now()}`,
        label: `+${objective.xp} XP`,
        message: objective.event,
      },
      ...currentEvents,
    ]);

    if (nextCompletedObjectiveIds.length === totalObjectives) {
      setPhase("complete");
    }
  };

  const resetMission = () => {
    setCompletedObjectiveIds([]);
    setExperiencePoints(0);
    setEvents([]);
    setPhase("briefing");
  };

  const returnToRoleSelection = () => {
    setSelectedRole(null);
    setCompletedObjectiveIds([]);
    setExperiencePoints(0);
    setEvents([]);
    setPhase("select");
  };

  if (phase === "select") {
    return (
      <section className="demo-mission demo-mission--selection">
        <div className="demo-mission__ambient demo-mission__ambient--left" />
        <div className="demo-mission__ambient demo-mission__ambient--right" />

        <div className="demo-mission__selection-content">
          <p className="demo-mission__eyebrow">
            Interactive SkillForge simulation
          </p>

          <h1>Choose your mission role</h1>

          <p className="demo-mission__lead">
            Join a simulated software team, complete a guided release mission,
            and experience how SkillForge coordinates projects, work, and
            communication.
          </p>

          <div className="demo-mission__notice">
            <strong>No account required.</strong>
            <span>
              All activity is simulated and resets when you leave the mission.
            </span>
          </div>

          <div className="demo-role-grid">
            <article className="demo-role-card">
              <span className="demo-role-card__type">Host mission</span>

              <h2>Lead the release</h2>

              <p>
                Organize the project, set priorities, assign critical work, and
                remove team blockers.
              </p>

              <ul>
                <li>Coordinate the release plan</li>
                <li>Assign and prioritize work</li>
                <li>Resolve collaborator blockers</li>
                <li>Approve the release milestone</li>
              </ul>

              <button
                className="demo-mission__button demo-mission__button--primary"
                type="button"
                onClick={() => selectRole("host")}
              >
                Continue as Host
              </button>
            </article>

            <article className="demo-role-card">
              <span className="demo-role-card__type">Collaborator mission</span>

              <h2>Complete the release</h2>

              <p>
                Claim meaningful work, communicate progress, review project
                activity, and complete a critical assignment.
              </p>

              <ul>
                <li>Review project priorities</li>
                <li>Claim an available work section</li>
                <li>Communicate progress and blockers</li>
                <li>Complete the release assignment</li>
              </ul>

              <button
                className="demo-mission__button demo-mission__button--primary"
                type="button"
                onClick={() => selectRole("collaborator")}
              >
                Continue as Collaborator
              </button>
            </article>
          </div>

          <Link className="demo-mission__exit-link" to="/">
            Return to the SkillForge Welcome Page
          </Link>
        </div>
      </section>
    );
  }

  if (phase === "briefing" && mission) {
    return (
      <section className="demo-mission demo-mission--briefing">
        <div className="demo-briefing">
          <div className="demo-briefing__header">
            <div>
              <p className="demo-mission__eyebrow">
                {mission.roleLabel} mission briefing
              </p>

              <h1>{mission.title}</h1>

              <p>{mission.summary}</p>
            </div>

            <span className="demo-briefing__status">Mission ready</span>
          </div>

          <div className="demo-briefing__project">
            <div>
              <span>Project</span>
              <strong>LaunchPad Platform</strong>
            </div>

            <div>
              <span>Release readiness</span>
              <strong>42%</strong>
            </div>

            <div>
              <span>Blocked sections</span>
              <strong>2</strong>
            </div>

            <div>
              <span>Objectives</span>
              <strong>{totalObjectives}</strong>
            </div>
          </div>

          <div className="demo-briefing__objectives">
            <h2>Mission objectives</h2>

            <ol>
              {mission.objectives.map((objective, index) => (
                <li key={objective.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>

                  <div>
                    <strong>{objective.title}</strong>
                    <p>{objective.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="demo-briefing__actions">
            <button
              className="demo-mission__button demo-mission__button--primary"
              type="button"
              onClick={startMission}
            >
              Start Mission
            </button>

            <button
              className="demo-mission__button demo-mission__button--secondary"
              type="button"
              onClick={returnToRoleSelection}
            >
              Choose another role
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (phase === "complete" && mission) {
    return (
      <section className="demo-mission demo-mission--complete">
        <div className="demo-complete">
          <span className="demo-complete__badge">Mission complete</span>

          <p className="demo-mission__eyebrow">LaunchPad release restored</p>

          <h1>You brought the project to release-ready status.</h1>

          <p className="demo-complete__summary">
            You completed all {totalObjectives} objectives as a{" "}
            {mission.roleLabel}, improved project readiness from 42% to 96%, and
            demonstrated SkillForge’s communication-first workflow.
          </p>

          <div className="demo-complete__score-grid">
            <div>
              <span>Total XP</span>
              <strong>{experiencePoints}</strong>
            </div>

            <div>
              <span>Objectives</span>
              <strong>
                {completedCount}/{totalObjectives}
              </strong>
            </div>

            <div>
              <span>Release readiness</span>
              <strong>96%</strong>
            </div>

            <div>
              <span>Mission rank</span>
              <strong>{mission.completionRank}</strong>
            </div>
          </div>

          <div className="demo-complete__achievements">
            <h2>Achievements unlocked</h2>

            <div>
              <span>Clear Communicator</span>
              <span>Team Unblocker</span>
              <span>Release Ready</span>
            </div>
          </div>

          <div className="demo-complete__actions">
            <button
              className="demo-mission__button demo-mission__button--primary"
              type="button"
              onClick={resetMission}
            >
              Replay this mission
            </button>

            <button
              className="demo-mission__button demo-mission__button--secondary"
              type="button"
              onClick={returnToRoleSelection}
            >
              Try another role
            </button>

            <Link
              className="demo-mission__button demo-mission__button--secondary"
              to="/#memberships"
            >
              Explore memberships
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="demo-mission demo-mission--active">
      <div className="demo-mode-banner">
        <div>
          <strong>Demo Mission</strong>
          <span>All project activity is simulated and will not be saved.</span>
        </div>

        <div className="demo-mode-banner__actions">
          <button type="button" onClick={resetMission}>
            Reset
          </button>

          <Link to="/">Exit demo</Link>
        </div>
      </div>

      <div className="demo-mission__active-header">
        <div>
          <p className="demo-mission__eyebrow">{mission.roleLabel} mission</p>

          <h1>{mission.title}</h1>

          <p>
            Complete the objectives in order to restore the LaunchPad release.
          </p>
        </div>

        <div className="demo-mission__xp">
          <span>Experience</span>
          <strong>{experiencePoints} XP</strong>
        </div>
      </div>

      <div className="demo-progress">
        <div className="demo-progress__heading">
          <span>
            Mission progress: {completedCount} of {totalObjectives}
          </span>

          <strong>{progressPercent}%</strong>
        </div>

        <div
          className="demo-progress__track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progressPercent}
          aria-label="Mission completion progress"
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="demo-workspace">
        <div className="demo-objectives-panel">
          <div className="demo-panel-heading">
            <div>
              <span>Guided workflow</span>
              <h2>Mission objectives</h2>
            </div>

            <strong>
              {completedCount}/{totalObjectives}
            </strong>
          </div>

          <div className="demo-objective-list">
            {mission.objectives.map((objective, index) => {
              const isCompleted = completedObjectiveIds.includes(objective.id);

              const isCurrent = currentObjective?.id === objective.id;
              const isLocked = !isCompleted && !isCurrent;

              const objectiveClassName = [
                "demo-objective",
                isCompleted && "demo-objective--completed",
                isCurrent && "demo-objective--current",
                isLocked && "demo-objective--locked",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <article key={objective.id} className={objectiveClassName}>
                  <div className="demo-objective__number">
                    {isCompleted ? "✓" : String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="demo-objective__content">
                    <div className="demo-objective__heading">
                      <div>
                        <span>
                          {isCompleted
                            ? "Completed"
                            : isCurrent
                              ? "Current objective"
                              : "Locked"}
                        </span>

                        <h3>{objective.title}</h3>
                      </div>

                      <strong>+{objective.xp} XP</strong>
                    </div>

                    <p>{objective.description}</p>

                    <button
                      type="button"
                      disabled={!isCurrent}
                      onClick={() => completeObjective(objective)}
                    >
                      {isCompleted
                        ? "Objective completed"
                        : isCurrent
                          ? objective.actionLabel
                          : "Complete previous objective"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="demo-mission-sidebar">
          <section className="demo-metrics-panel">
            <div className="demo-panel-heading">
              <div>
                <span>Project telemetry</span>
                <h2>Release status</h2>
              </div>
            </div>

            <div className="demo-metric">
              <div>
                <span>Release readiness</span>
                <strong>{releaseReadiness}%</strong>
              </div>

              <div className="demo-metric__track">
                <span style={{ width: `${releaseReadiness}%` }} />
              </div>
            </div>

            <div className="demo-metric-grid">
              <div>
                <span>Blocked sections</span>
                <strong>{blockedSections}</strong>
              </div>

              <div>
                <span>Team members</span>
                <strong>4</strong>
              </div>

              <div>
                <span>Active work</span>
                <strong>{Math.min(3, completedCount + 1)}</strong>
              </div>

              <div>
                <span>Release risk</span>
                <strong>{releaseReadiness >= 78 ? "Low" : "Elevated"}</strong>
              </div>
            </div>
          </section>

          <section className="demo-events-panel">
            <div className="demo-panel-heading">
              <div>
                <span>Live simulation</span>
                <h2>Project activity</h2>
              </div>
            </div>

            <div className="demo-event-list" aria-live="polite">
              {events.length === 0 ? (
                <p className="demo-event-list__empty">
                  Complete an objective to generate project activity.
                </p>
              ) : (
                events.map((event) => (
                  <article key={event.id} className="demo-event">
                    <span>{event.label}</span>
                    <p>{event.message}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="demo-preview-links">
            <span>Explore full workspace previews</span>

            <Link to="/host-preview">Host Dashboard</Link>

            <Link to="/collaborator-preview">Collaborator Dashboard</Link>
          </section>
        </aside>
      </div>
    </section>
  );
}

export default DemoMission;
