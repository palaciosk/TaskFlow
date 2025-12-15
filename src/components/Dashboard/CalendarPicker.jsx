import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import './CalendarPicker.css';

const CalendarPicker = ({ selectedDate, onSelectDate, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days from previous month to fill the first week
  const startDay = monthStart.getDay();
  const previousMonthDays = [];
  for (let i = 0; i < startDay; i++) {
    previousMonthDays.push(new Date(monthStart.getTime() - (startDay - i) * 24 * 60 * 60 * 1000));
  }

  const handleDateClick = (day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    onSelectDate(dateString);
    onClose();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    handleDateClick(today);
  };

  return (
    <div className="calendar-picker" onClick={(e) => e.stopPropagation()}>
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={handlePrevMonth}>
          <ChevronLeft size={18} />
        </button>
        <h3 className="calendar-month-year">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button type="button" className="calendar-nav-btn" onClick={handleNextMonth}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days-wrapper">
        <div 
          key={format(currentMonth, 'yyyy-MM')} 
          className="calendar-days fade-in"
        >
          {previousMonthDays.map((day, idx) => (
            <div key={`prev-${idx}`} className="calendar-day other-month">
              {format(day, 'd')}
            </div>
          ))}
          {daysInMonth.map((day) => {
            const isSelected = selectedDate && isSameDay(new Date(selectedDate), day);
            const isTodayDate = isToday(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="calendar-footer">
        <button type="button" className="calendar-today-btn" onClick={handleToday}>
          Today
        </button>
      </div>
    </div>
  );
};

export default CalendarPicker;

