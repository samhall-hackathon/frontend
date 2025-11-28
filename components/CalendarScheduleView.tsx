import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Download, Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Contract, Person, Assignment, TimeEntry } from '../App';

interface CalendarScheduleViewProps {
  contracts: Contract[];
  people: Person[];
  assignments: Assignment[];
  timeEntries: TimeEntry[];
  onAddTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  onUpdateTimeEntry: (entryId: string, hoursClocked: number) => void;
  onDeleteTimeEntry: (entryId: string) => void;
}

export function CalendarScheduleView({
  contracts,
  people,
  assignments,
  timeEntries,
  onAddTimeEntry,
}: CalendarScheduleViewProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    assignmentId: '',
    date: '',
    hoursClocked: ''
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort contracts by date
  const sortedContracts = [...contracts].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Generate calendar for a contract
  const generateCalendar = (contract: Contract) => {
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    const days = [];
    
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Get time entry for a specific person and date
  const getTimeEntryForDate = (personId: string, contractId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeEntries.find(e => 
      e.personId === personId && 
      e.date === dateStr &&
      e.contractId === contractId
    );
  };

  // Calculate expected daily hours for an assignment
  const getExpectedDailyHours = (assignment: Assignment, contract: Contract) => {
    const startDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const workDays = totalDays; // Including weekends as per requirement
    return assignment.hoursAssigned / workDays;
  };

  // Check if a day is underperforming (past date with less hours than expected)
  const isDayUnderperforming = (assignment: Assignment, contract: Contract, date: Date) => {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    
    // Only check if date is in the past
    if (dateObj >= today) {
      return false;
    }

    const entry = getTimeEntryForDate(assignment.personId, contract.id, date);
    const expectedHours = getExpectedDailyHours(assignment, contract);
    
    // If no entry for past date, it's underperforming
    if (!entry) {
      return true;
    }

    // If hours clocked is less than expected, it's underperforming
    return entry.hoursClocked < expectedHours;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj.getTime() === today.getTime();
  };

  // Export schedule as CSV
  const exportSchedule = () => {
    let csv = 'Complete Schedule Report\n';
    csv += 'Generated: ' + new Date().toLocaleString() + '\n\n';

    sortedContracts.forEach(contract => {
      const contractAssignments = assignments.filter(a => a.contractId === contract.id);
      
      csv += `\n${contract.vendorName} (${contract.status.toUpperCase()})\n`;
      csv += `Period: ${contract.startDate} to ${contract.endDate}\n`;
      csv += `Region: ${contract.region}\n\n`;
      csv += 'Date,Person,Hours Clocked,Expected Hours,Status\n';

      const calendarDays = generateCalendar(contract);
      
      calendarDays.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        contractAssignments.forEach(assignment => {
          const person = people.find(p => p.id === assignment.personId);
          const entry = timeEntries.find(e => 
            e.assignmentId === assignment.id && e.date === dateStr
          );
          const expectedHours = getExpectedDailyHours(assignment, contract);
          const status = isDayUnderperforming(assignment, contract, day) ? 'UNDERPERFORMING' : 'OK';
          
          csv += `${dateStr},${person?.name},${entry?.hoursClocked || 0},${expectedHours.toFixed(1)},${status}\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete-schedule-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export performance report
  const exportPerformanceReport = () => {
    let csv = 'Performance Report - All Contracts\n';
    csv += 'Generated: ' + new Date().toLocaleString() + '\n\n';

    sortedContracts.forEach(contract => {
      const contractAssignments = assignments.filter(a => a.contractId === contract.id);
      
      csv += `\n${contract.vendorName}\n`;
      csv += `Status,${contract.status}\n`;
      csv += `Period,${contract.startDate} to ${contract.endDate}\n`;
      csv += `Total Hours Required,${contract.hoursRequired}\n\n`;

      csv += 'Person,Assigned Hours,Clocked Hours,Performance %,Variance\n';

      let totalAssigned = 0;
      let totalClocked = 0;

      contractAssignments.forEach(assignment => {
        const person = people.find(p => p.id === assignment.personId);
        const entries = timeEntries.filter(e => e.assignmentId === assignment.id);
        const clockedHours = entries.reduce((sum, e) => sum + e.hoursClocked, 0);
        
        totalAssigned += assignment.hoursAssigned;
        totalClocked += clockedHours;
        
        const performance = assignment.hoursAssigned > 0 ? (clockedHours / assignment.hoursAssigned) * 100 : 0;
        const variance = clockedHours - assignment.hoursAssigned;
        
        csv += `${person?.name},${assignment.hoursAssigned},${clockedHours},${performance.toFixed(1)}%,${variance > 0 ? '+' : ''}${variance}\n`;
      });

      csv += `\nContract Total,${totalAssigned},${totalClocked},${totalAssigned > 0 ? ((totalClocked / totalAssigned) * 100).toFixed(1) : 0}%,${totalClocked - totalAssigned}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddTimeEntry = () => {
    const assignment = assignments.find(a => a.id === newTimeEntry.assignmentId);
    if (!assignment) return;

    onAddTimeEntry({
      assignmentId: newTimeEntry.assignmentId,
      personId: assignment.personId,
      contractId: assignment.contractId,
      date: newTimeEntry.date,
      hoursClocked: parseFloat(newTimeEntry.hoursClocked)
    });

    setIsAddDialogOpen(false);
    setNewTimeEntry({ assignmentId: '', date: '', hoursClocked: '' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">No contracts available. Please add a contract first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <CardTitle>Schedule Timeline</CardTitle>
              <CardDescription>View past, current, and upcoming 2-week assignments</CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">Log Time</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Time Entry</DialogTitle>
                    <DialogDescription>Record hours worked for an assignment</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Assignment</Label>
                      <Select 
                        value={newTimeEntry.assignmentId}
                        onValueChange={(value) => setNewTimeEntry({ ...newTimeEntry, assignmentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignment" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignments.map(assignment => {
                            const person = people.find(p => p.id === assignment.personId);
                            const contract = contracts.find(c => c.id === assignment.contractId);
                            return (
                              <SelectItem key={assignment.id} value={assignment.id}>
                                {person?.name} - {contract?.vendorName} ({assignment.hoursAssigned}h)
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newTimeEntry.date}
                        onChange={(e) => setNewTimeEntry({ ...newTimeEntry, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hours Worked</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={newTimeEntry.hoursClocked}
                        onChange={(e) => setNewTimeEntry({ ...newTimeEntry, hoursClocked: e.target.value })}
                        placeholder="Enter hours"
                      />
                    </div>
                    <Button onClick={handleAddTimeEntry} className="w-full">
                      Log Time
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={exportSchedule} variant="outline" className="gap-2">
                <Download className="size-4" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>

              <Button onClick={exportPerformanceReport} className="gap-2">
                <Download className="size-4" />
                <span className="hidden sm:inline">Report</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline View - All Contracts */}
      <div className="space-y-8">
        {sortedContracts.map(contract => {
          const contractAssignments = assignments.filter(a => a.contractId === contract.id);
          const calendarDays = generateCalendar(contract);
          
          if (contractAssignments.length === 0) return null;

          return (
            <Card key={contract.id} className={contract.status === 'completed' ? 'border-green-200' : contract.status === 'active' ? 'border-blue-200' : 'border-orange-200'}>
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{contract.vendorName}</CardTitle>
                      <Badge variant={contract.status === 'completed' ? 'default' : contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status === 'completed' ? <CheckCircle2 className="size-3 mr-1" /> : null}
                        {contract.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()} • {contract.region} Region
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contractAssignments.map(assignment => {
                    const person = people.find(p => p.id === assignment.personId);
                    const entries = timeEntries.filter(e => e.assignmentId === assignment.id);
                    const totalClocked = entries.reduce((sum, e) => sum + e.hoursClocked, 0);
                    const expectedDaily = getExpectedDailyHours(assignment, contract);
                    
                    return (
                      <div key={assignment.id} className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <span className="text-blue-600">{person?.name.charAt(0)}</span>
                            </div>
                            <div>
                              <h3 className="text-slate-900">{person?.name}</h3>
                              <p className="text-slate-500">
                                {totalClocked}h / {assignment.hoursAssigned}h • ~{expectedDaily.toFixed(1)}h/day
                              </p>
                            </div>
                          </div>
                          {totalClocked < assignment.hoursAssigned && contract.status !== 'pending' && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="size-3" />
                              {(assignment.hoursAssigned - totalClocked).toFixed(1)}h behind
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-2">
                          {calendarDays.map((day, index) => {
                            const entry = getTimeEntryForDate(assignment.personId, contract.id, day);
                            const isWeekendDay = isWeekend(day);
                            const isTodayDate = isToday(day);
                            const isUnderperforming = isDayUnderperforming(assignment, contract, day);
                            
                            return (
                              <div
                                key={index}
                                className={`p-2 sm:p-3 border rounded-lg text-center space-y-1 relative ${
                                  isWeekendDay ? 'bg-slate-50' : 'bg-white'
                                } ${
                                  isUnderperforming ? 'border-red-500 bg-red-50' : ''
                                } ${
                                  isTodayDate ? 'ring-2 ring-blue-500 ring-inset' : ''
                                }`}
                              >
                                <div className="text-slate-500 text-xs sm:text-sm">
                                  {formatDate(day).split(',')[0]}
                                </div>
                                <div className="text-slate-900">
                                  {day.getDate()}
                                </div>
                                {entry ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                                      isUnderperforming ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      <Clock className="size-3" />
                                      <span>{entry.hoursClocked}h</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-slate-400 text-xs sm:text-sm">-</div>
                                )}
                                {isUnderperforming && (
                                  <AlertTriangle className="size-3 text-red-500 absolute top-1 right-1" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {contractAssignments.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Contract Total:</span>
                      <span className="text-slate-900">
                        {contractAssignments.reduce((sum, a) => {
                          const entries = timeEntries.filter(e => e.assignmentId === a.id);
                          return sum + entries.reduce((s, e) => s + e.hoursClocked, 0);
                        }, 0)}h / {contract.hoursRequired}h
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <div className="size-4 bg-white border rounded"></div>
              <span className="text-slate-600">Weekday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-slate-50 border rounded"></div>
              <span className="text-slate-600">Weekend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-white border border-blue-500 ring-2 ring-blue-500 ring-inset rounded"></div>
              <span className="text-slate-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-red-50 border border-red-500 rounded"></div>
              <span className="text-slate-600">Underperforming (Past)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-green-600" />
              <span className="text-slate-600">Hours Logged</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}