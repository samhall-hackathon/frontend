import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Edit2, Trash2, Plus, User, Clock, Building2 } from 'lucide-react';
import { Contract, Person, Assignment } from '../App';

interface AssignmentViewProps {
  contracts: Contract[];
  people: Person[];
  assignments: Assignment[];
  onUpdateAssignment: (assignmentId: string, newHours: number) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onAddAssignment: (contractId: string, personId: string, hours: number) => void;
}

export function AssignmentView({
  contracts,
  people,
  assignments,
  onUpdateAssignment,
  onDeleteAssignment,
  onAddAssignment
}: AssignmentViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    contractId: '',
    personId: '',
    hours: ''
  });

  const handleEdit = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setEditHours(assignment.hoursAssigned.toString());
  };

  const handleSaveEdit = (assignmentId: string) => {
    const hours = parseInt(editHours);
    if (hours > 0) {
      onUpdateAssignment(assignmentId, hours);
    }
    setEditingId(null);
  };

  const handleAddAssignment = () => {
    const hours = parseInt(newAssignment.hours);
    if (newAssignment.contractId && newAssignment.personId && hours > 0) {
      onAddAssignment(newAssignment.contractId, newAssignment.personId, hours);
      setIsAddDialogOpen(false);
      setNewAssignment({ contractId: '', personId: '', hours: '' });
    }
  };

  const getPersonById = (personId: string) => people.find(p => p.id === personId);
  const getContractById = (contractId: string) => contracts.find(c => c.id === contractId);

  const assignmentsByContract = contracts.map(contract => {
    const contractAssignments = assignments.filter(a => a.contractId === contract.id);
    const totalAssigned = contractAssignments.reduce((sum, a) => sum + a.hoursAssigned, 0);
    const remaining = contract.hoursRequired - totalAssigned;

    return {
      contract,
      assignments: contractAssignments,
      totalAssigned,
      remaining
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assignment Management</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Add Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Assignment</DialogTitle>
                  <DialogDescription>Assign a person to a contract manually</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contract</Label>
                    <Select 
                      value={newAssignment.contractId}
                      onValueChange={(value) => setNewAssignment({ ...newAssignment, contractId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract" />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts.map(contract => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.vendorName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Person</Label>
                    <Select 
                      value={newAssignment.personId}
                      onValueChange={(value) => setNewAssignment({ ...newAssignment, personId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {people.map(person => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name} ({person.maxHours - person.hoursAllocated}h available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hours to Assign</Label>
                    <Input
                      type="number"
                      value={newAssignment.hours}
                      onChange={(e) => setNewAssignment({ ...newAssignment, hours: e.target.value })}
                      placeholder="Enter hours"
                    />
                  </div>
                  <Button onClick={handleAddAssignment} className="w-full">
                    Create Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {assignmentsByContract.map(({ contract, assignments: contractAssignments, totalAssigned, remaining }) => (
          <Card key={contract.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-5 text-blue-600" />
                    {contract.vendorName}
                  </CardTitle>
                  <p className="text-slate-600">Contract: {contract.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">Total Required</p>
                  <p className="text-slate-900">{contract.hoursRequired} hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-slate-600">Assigned</p>
                  <p className="text-green-600">{totalAssigned} hours</p>
                </div>
                <div>
                  <p className="text-slate-600">Remaining</p>
                  <p className={remaining > 0 ? "text-orange-600" : "text-slate-900"}>
                    {remaining} hours
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Status</p>
                  <Badge variant={remaining === 0 ? "default" : "secondary"}>
                    {remaining === 0 ? "Complete" : "In Progress"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-slate-900">Assigned Personnel</h3>
                {contractAssignments.length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No assignments yet</p>
                ) : (
                  <div className="space-y-2">
                    {contractAssignments.map((assignment) => {
                      const person = getPersonById(assignment.personId);
                      if (!person) return null;

                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-4 bg-white border rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="size-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-900">{person.name}</p>
                              <p className="text-slate-500">
                                {person.region} Region • {person.hoursAllocated}/{person.maxHours}h total
                              </p>
                            </div>
                            <div className="text-right">
                              {editingId === assignment.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={editHours}
                                    onChange={(e) => setEditHours(e.target.value)}
                                    className="w-20"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(assignment.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                                    <Clock className="size-4" />
                                    <span>{assignment.hoursAssigned} hours</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(assignment)}
                                    >
                                      <Edit2 className="size-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => onDeleteAssignment(assignment.id)}
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}