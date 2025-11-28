import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { User, MapPin, Clock, Calendar } from 'lucide-react';
import { Person } from '../App';

interface ManpowerRosterProps {
  people: Person[];
}

export function ManpowerRoster({ people }: ManpowerRosterProps) {
  const getAvailabilityColor = (person: Person) => {
    const percentage = (person.hoursAllocated / person.maxHours) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getAvailabilityStatus = (person: Person) => {
    const percentage = (person.hoursAllocated / person.maxHours) * 100;
    if (percentage >= 90) return 'Almost Full';
    if (percentage >= 70) return 'Limited';
    return 'Available';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workforce Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-slate-600">Total Staff</p>
              <p className="text-slate-900">{people.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600">Fully Available</p>
              <p className="text-green-600">{people.filter(p => p.hoursAllocated === 0).length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600">Partially Allocated</p>
              <p className="text-orange-600">{people.filter(p => p.hoursAllocated > 0 && p.hoursAllocated < p.maxHours).length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600">Fully Allocated</p>
              <p className="text-red-600">{people.filter(p => p.hoursAllocated >= p.maxHours).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-slate-900">Personnel Roster</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => {
            const availableHours = person.maxHours - person.hoursAllocated;
            const percentage = (person.hoursAllocated / person.maxHours) * 100;

            return (
              <Card key={person.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="size-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-900">{person.name}</CardTitle>
                        <p className="text-slate-500">ID: {person.id}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="size-4" />
                    <span>{person.region} Region</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" />
                        Hours Allocated
                      </span>
                      <span className={getAvailabilityColor(person)}>
                        {person.hoursAllocated} / {person.maxHours}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-slate-500">
                      {availableHours} hours available
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="size-4" />
                    <span>{person.holidays} holidays remaining</span>
                  </div>

                  <div>
                    <p className="text-slate-600 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {person.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <Badge 
                    variant={percentage >= 90 ? 'destructive' : percentage >= 70 ? 'default' : 'outline'}
                    className="w-full justify-center"
                  >
                    {getAvailabilityStatus(person)}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
