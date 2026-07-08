import { Icon } from "../Icon/Icon";
import "./CalendarCard.css";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS_IN_MONTH = 30;
const FIRST_WEEKDAY_OFFSET = 1;
const SCHEDULED_DAYS = new Set([9, 11, 16, 18, 25]);
const TODAY = 4;

export function CalendarCard() {
  const cells: (number | null)[] = [
    ...Array(FIRST_WEEKDAY_OFFSET).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <div className="calendar-card">
      <div className="calendar-card__header">
        <div>
          <h3>June 2026</h3>
          <span>Project timeline</span>
        </div>
        <button className="link">
          Full calendar
          <Icon name="arrow-right" size={14} />
        </button>
      </div>

      <div className="calendar-card__grid calendar-card__grid--weekdays">
        {WEEKDAYS.map((day, i) => (
          <span key={`${day}-${i}`}>{day}</span>
        ))}
      </div>

      <div className="calendar-card__grid">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`calendar-card__day ${day === TODAY ? "calendar-card__day--today" : ""}`}
          >
            {day && (
              <>
                {day}
                {(SCHEDULED_DAYS.has(day) || day === TODAY) && (
                  <span className="calendar-card__dot" />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="calendar-card__legend">
        <span className="calendar-card__dot" />
        Session scheduled
      </div>
    </div>
  );
}
