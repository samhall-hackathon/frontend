import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  Users,
  Building2,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Contract, Person, Assignment, TimeEntry } from '../App';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface WorkforceScheduleProps {
  contracts: Contract[];
  people: Person[];
  assignments: Assignment[];
  timeEntries: TimeEntry[];
  onAddTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  onUpdateTimeEntry: (entryId: string, hoursClocked: number) => void;
  onDeleteTimeEntry: (entryId: string) => void;
}

export function WorkforceSchedule({
  contracts,
  people,
  assignments,
  timeEntries,
  onAddTimeEntry,
}: WorkforceScheduleProps) {
  const [viewMode, setViewMode] = useState<'personnel' | 'company'>('personnel');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    assignmentId: '',
    date: '',
    hoursClocked: ''
  });
  const [openPersonnel, setOpenPersonnel] = useState<Record<string, boolean>>({});
  const [openCompanies, setOpenCompanies] = useState<Record<string, boolean>>({});

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate current month and 2-week period
  const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  const getTwoWeekPeriod = () => {
    const start = new Date(today);
    const end = new Date(today);
    end.setDate(end.getDate() + 13); // 2 weeks = 14 days
    return { start, end };
  };

  const { firstDay: monthStart, lastDay: monthEnd } = getCurrentMonthDates();
  const { start: twoWeekStart, end: twoWeekEnd } = getTwoWeekPeriod();

  // Generate calendar days for a date range
  const generateCalendarDays = (startDate: Date, endDate: Date) => {
    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Get assignments for a person
  const getPersonAssignments = (personId: string) => {
    return assignments.filter(a => a.personId === personId);
  };

  // Get time entries for a person
  const getPersonTimeEntries = (personId: string) => {
    return timeEntries.filter(e => e.personId === personId);
  };

  // Calculate hours for a person
  const calculatePersonHours = (personId: string) => {
    const personAssignments = getPersonAssignments(personId);
    const personTimeEntries = getPersonTimeEntries(personId);
    
    const hoursAssigned = personAssignments.reduce((sum, a) => sum + a.hoursAssigned, 0);
    const hoursWorked = personTimeEntries.reduce((sum, e) => sum + e.hoursClocked, 0);
    const person = people.find(p => p.id === personId);
    const hoursUnassigned = person ? person.maxHours - hoursAssigned : 0;
    const hoursRemaining = hoursAssigned - hoursWorked;

    return {
      assigned: hoursAssigned,
      worked: hoursWorked,
      unassigned: hoursUnassigned,
      remaining: hoursRemaining
    };
  };

  // Get time entry for a specific date
  const getTimeEntryForDate = (personId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeEntries.find(e => e.personId === personId && e.date === dateStr);
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj.getTime() === today.getTime();
  };

  // Check if date is weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Get contract assignments
  const getContractAssignments = (contractId: string) => {
    return assignments.filter(a => a.contractId === contractId);
  };

  // Calculate contract hours
  const calculateContractHours = (contractId: string) => {
    const contractAssignments = getContractAssignments(contractId);
    const contractTimeEntries = timeEntries.filter(e => e.contractId === contractId);
    
    const totalAssigned = contractAssignments.reduce((sum, a) => sum + a.hoursAssigned, 0);
    const totalWorked = contractTimeEntries.reduce((sum, e) => sum + e.hoursClocked, 0);
    
    return {
      assigned: totalAssigned,
      worked: totalWorked
    };
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

  // Export schedule
  const exportSchedule = () => {
    let csv = 'SamhallSchedules - Complete Report\\n';
    csv += 'Generated: ' + new Date().toLocaleString() + '\\n\\n';

    if (viewMode === 'personnel') {
      csv += 'PERSONNEL VIEW\\n\\n';
      people.forEach(person => {
        const hours = calculatePersonHours(person.id);
        const personAssignments = getPersonAssignments(person.id);
        csv += `${person.name}\\n`;
        csv += `Region: ${person.region}\\n`;
        csv += `Hours Assigned: ${hours.assigned}\\n`;
        csv += `Hours Worked: ${hours.worked}\\n`;
        csv += `Hours Remaining: ${hours.remaining}\\n`;
        csv += `Hours Unassigned: ${hours.unassigned}\\n`;
        csv += '\\nContracts:\\n';
        personAssignments.forEach(assignment => {
          const contract = contracts.find(c => c.id === assignment.contractId);
          csv += `  ${contract?.vendorName} - ${assignment.hoursAssigned}h\\n`;
        });
        csv += '\\n';
      });
    } else {
      csv += 'COMPANY VIEW\\n\\n';
      contracts.forEach(contract => {
        const contractAssignments = getContractAssignments(contract.id);
        const hours = calculateContractHours(contract.id);
        csv += `${contract.vendorName}\\n`;
        csv += `Status: ${contract.status}\\n`;
        csv += `Period: ${contract.startDate} to ${contract.endDate}\\n`;
        csv += `Required Hours: ${contract.hoursRequired}\\n`;
        csv += `Assigned Hours: ${hours.assigned}\\n`;
        csv += `Worked Hours: ${hours.worked}\\n`;
        csv += `Personnel Count: ${contractAssignments.length}\\n`;
        csv += '\\nAssigned Personnel:\\n';
        contractAssignments.forEach(assignment => {
          const person = people.find(p => p.id === assignment.personId);
          csv += `  ${person?.name} - ${assignment.hoursAssigned}h\\n`;
        });
        csv += '\\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samhall-${viewMode}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const twoWeekDays = generateCalendarDays(twoWeekStart, twoWeekEnd);

  return (
    <div className="space-y-6">
      {/* Workforce Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Workforce Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Staff</p>
              <p className="text-foreground">{people.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Fully Available</p>
              <p className="text-green-600">{people.filter(p => p.hoursAllocated === 0).length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Partially Allocated</p>
              <p className="text-orange-600">{people.filter(p => p.hoursAllocated > 0 && p.hoursAllocated < p.maxHours).length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Fully Allocated</p>
              <p style={{ color: '#ED1C24' }}>{people.filter(p => p.hoursAllocated >= p.maxHours).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>View schedules by personnel or company</CardDescription>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Personnel</span>
                <Switch 
                  checked={viewMode === 'company'} 
                  onCheckedChange={(checked) => setViewMode(checked ? 'company' : 'personnel')}
                />
                <Building2 className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Company</span>
              </div>
              
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

              <Button onClick={exportSchedule} className="gap-2">
                <Download className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personnel View */}
      {viewMode === 'personnel' && (
        <div className="space-y-4">
          <h2 className="text-foreground">Personnel Schedule</h2>
          {people.map((person) => {
            const hours = calculatePersonHours(person.id);
            const personAssignments = getPersonAssignments(person.id);
            const percentage = (person.hoursAllocated / person.maxHours) * 100;
            const isOpen = openPersonnel[person.id] || false;

            return (
              <Card key={person.id}>
                <Collapsible open={isOpen} onOpenChange={(open) => setOpenPersonnel({ ...openPersonnel, [person.id]: open })}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {isOpen ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                          <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E7DAF8' }}>
                            <User className="size-6" style={{ color: '#172240' }} />
                          </div>
                          <div>
                            <CardTitle>{person.name}</CardTitle>
                            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="size-4" />
                                <span>{person.region}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="size-4" />
                                <span>{hours.assigned}h / {person.maxHours}h</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={percentage} className="w-32 h-2" />
                          <Badge variant={percentage >= 90 ? 'destructive' : percentage >= 70 ? 'default' : 'outline'}>
                            {percentage >= 90 ? 'Full' : percentage >= 70 ? 'Limited' : 'Available'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      {/* Hours Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#E7DAF8' }}>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Hours Assigned</p>
                          <p className="text-foreground">{hours.assigned}h</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Hours Worked</p>
                          <p className="text-green-600">{hours.worked}h</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Hours Remaining</p>
                          <p className="text-orange-600">{hours.remaining}h</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Hours Unassigned</p>
                          <p className="text-muted-foreground">{hours.unassigned}h</p>
                        </div>
                      </div>

                      {/* Allocated Companies */}
                      {personAssignments.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-foreground">Allocated Contracts</h3>
                          {personAssignments.map(assignment => {
                            const contract = contracts.find(c => c.id === assignment.contractId);
                            if (!contract) return null;
                            const entries = timeEntries.filter(e => e.assignmentId === assignment.id);
                            const worked = entries.reduce((sum, e) => sum + e.hoursClocked, 0);

                            return (
                              <div key={assignment.id} className="p-3 border rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="size-4 text-muted-foreground" />
                                    <span className="text-foreground">{contract.vendorName}</span>
                                    <Badge variant={contract.status === 'completed' ? 'default' : contract.status === 'active' ? 'default' : 'secondary'}>
                                      {contract.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Assigned: </span>
                                    <span className="text-foreground">{assignment.hoursAssigned}h</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Worked: </span>
                                    <span className="text-foreground">{worked}h</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2-Week Calendar */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="text-foreground">Schedule (Next 2 Weeks)</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {twoWeekStart.toLocaleDateString()} - {twoWeekEnd.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                          {twoWeekDays.map((day, index) => {
                            const entry = getTimeEntryForDate(person.id, day);
                            const isWeekendDay = isWeekend(day);
                            const isTodayDate = isToday(day);

                            return (
                              <div
                                key={index}
                                className={`p-1 sm:p-2 border rounded-lg text-center space-y-0.5 sm:space-y-1 ${
                                  isWeekendDay ? 'bg-muted/30' : 'bg-background'
                                } ${
                                  isTodayDate ? 'ring-2 ring-inset' : ''
                                }`}
                                style={isTodayDate ? { borderColor: '#172240', ringColor: '#172240' } : {}}
                              >
                                <div className="text-muted-foreground text-[10px] sm:text-xs">
                                  {formatDate(day).split(',')[0].substring(0, 3)}
                                </div>
                                <div className="text-foreground text-xs sm:text-sm">
                                  {day.getDate()}
                                </div>
                                {entry ? (
                                  <div className="flex items-center justify-center gap-0.5 text-[10px] sm:text-xs text-green-600">
                                    <Clock className="size-2 sm:size-3" />
                                    <span>{entry.hoursClocked}h</span>
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground text-[10px] sm:text-xs">-</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Company View */}
      {viewMode === 'company' && (
        <div className="space-y-4">
          <h2 className="text-foreground">Company Schedule</h2>
          {contracts.map((contract) => {
            const contractAssignments = getContractAssignments(contract.id);
            const hours = calculateContractHours(contract.id);
            const isOpen = openCompanies[contract.id] || false;

            if (contractAssignments.length === 0) return null;

            return (
              <Card key={contract.id}>
                <Collapsible open={isOpen} onOpenChange={(open) => setOpenCompanies({ ...openCompanies, [contract.id]: open })}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {isOpen ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                          <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ED1C24' }}>
                            <Building2 className="size-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle>{contract.vendorName}</CardTitle>
                              <Badge variant={contract.status === 'completed' ? 'default' : contract.status === 'active' ? 'default' : 'secondary'}>
                                {contract.status === 'completed' && <CheckCircle2 className="size-3 mr-1" />}
                                {contract.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="size-4" />
                                <span>{contract.region}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                <span>{new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Personnel</p>
                            <p className="text-foreground">{contractAssignments.length}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Required</p>
                            <p className="text-foreground">{contract.hoursRequired}h</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      {/* Hours Summary */}
                      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#E7DAF8' }}>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Required Hours</p>
                          <p className="text-foreground">{contract.hoursRequired}h</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Assigned Hours</p>
                          <p className="text-foreground">{hours.assigned}h</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Worked Hours</p>
                          <p className="text-green-600">{hours.worked}h</p>
                        </div>
                      </div>

                      {/* Assigned Personnel */}
                      <div className="space-y-3">
                        <h3 className="text-foreground">Assigned Personnel ({contractAssignments.length})</h3>
                        <div className="grid gap-3">
                          {contractAssignments.map(assignment => {
                            const person = people.find(p => p.id === assignment.personId);
                            if (!person) return null;
                            const entries = timeEntries.filter(e => e.assignmentId === assignment.id);
                            const worked = entries.reduce((sum, e) => sum + e.hoursClocked, 0);
                            const remaining = assignment.hoursAssigned - worked;

                            return (
                              <div key={assignment.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E7DAF8' }}>
                                      <User className="size-5" style={{ color: '#172240' }} />
                                    </div>
                                    <div>
                                      <h4 className="text-foreground">{person.name}</h4>
                                      <p className="text-sm text-muted-foreground">{person.region} Region</p>
                                    </div>
                                  </div>
                                  {remaining > 0 && contract.status !== 'pending' && (
                                    <Badge variant="destructive" className="gap-1">
                                      <AlertTriangle className="size-3" />
                                      {remaining}h behind
                                    </Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Assigned: </span>
                                    <span className="text-foreground">{assignment.hoursAssigned}h</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Worked: </span>
                                    <span className="text-foreground">{worked}h</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Remaining: </span>
                                    <span className="text-foreground">{remaining}h</span>
                                  </div>
                                </div>

                                {/* 2-Week Calendar for this person on this contract */}
                                <div className="mt-4 space-y-2">
                                  <p className="text-xs sm:text-sm text-muted-foreground">Schedule (Next 2 Weeks)</p>
                                  <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                                    {twoWeekDays.map((day, index) => {
                                      const entry = getTimeEntryForDate(person.id, day);
                                      const isWeekendDay = isWeekend(day);
                                      const isTodayDate = isToday(day);

                                      return (
                                        <div
                                          key={index}
                                          className={`p-0.5 sm:p-1 border rounded text-center space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs ${
                                            isWeekendDay ? 'bg-muted/30' : 'bg-background'
                                          } ${
                                            isTodayDate ? 'ring-1 ring-inset' : ''
                                          }`}
                                          style={isTodayDate ? { borderColor: '#172240', ringColor: '#172240' } : {}}
                                        >
                                          <div className="text-muted-foreground">{day.getDate()}</div>
                                          {entry ? (
                                            <div className="text-green-600">{entry.hoursClocked}h</div>
                                          ) : (
                                            <div className="text-muted-foreground">-</div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
