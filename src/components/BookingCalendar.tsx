import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, isBefore, startOfDay, eachDayOfInterval } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BookingCalendarProps {
  bookedDates: { start: Date; end: Date }[];
  onSelectRange: (start: Date | null, end: Date | null) => void;
}

export default function BookingCalendar({ bookedDates, onSelectRange }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const isBooked = (date: Date) => {
    return bookedDates.some(range => {
      const interval = eachDayOfInterval({ start: range.start, end: range.end });
      return interval.some(d => isSameDay(d, date));
    });
  };

  const isPast = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  const handleDateClick = (date: Date) => {
    if (isBooked(date) || isPast(date)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      onSelectRange(date, null);
    } else if (startDate && !endDate) {
      if (isBefore(date, startDate)) {
        setStartDate(date);
        onSelectRange(date, null);
      } else {
        // Check if any booked dates in between
        const interval = eachDayOfInterval({ start: startDate, end: date });
        const hasBooked = interval.some(d => isBooked(d));
        if (!hasBooked) {
          setEndDate(date);
          onSelectRange(startDate, date);
        } else {
          setStartDate(date);
          onSelectRange(date, null);
        }
      }
    }
  };

  const renderDays = () => {
    const days = [];
    const start = startOfDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    const end = addDays(start, 35); // Simple 5-week view

    for (let i = 0; i < 35; i++) {
      const date = addDays(start, i);
      const booked = isBooked(date);
      const past = isPast(date);
      const selected = (startDate && isSameDay(date, startDate)) || (endDate && isSameDay(date, endDate));
      const inRange = startDate && endDate && date > startDate && date < endDate;

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(date)}
          disabled={booked || past}
          className={cn(
            "h-10 w-full flex items-center justify-center rounded-lg text-sm font-semibold transition-all relative",
            booked ? "bg-red-50 text-red-300 cursor-not-allowed" : 
            past ? "text-gray-200 cursor-not-allowed" :
            selected ? "bg-indigo-600 text-white shadow-md z-10" :
            inRange ? "bg-indigo-50 text-indigo-600" :
            "hover:bg-gray-100 text-gray-700"
          )}
        >
          {format(date, 'd')}
          {booked && <div className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full"></div>}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-indigo-600" />
          <span>Select Dates</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))} className="p-2 hover:bg-gray-50 rounded-lg">
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))} className="p-2 hover:bg-gray-50 rounded-lg">
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
          <span className="text-gray-500">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 rounded-full"></div>
          <span className="text-gray-500">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
          <span className="text-gray-500">Available</span>
        </div>
      </div>
    </div>
  );
}
