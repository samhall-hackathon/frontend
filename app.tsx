import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { ContractManagement } from "./components/ContractManagement";
import { AssignmentView } from "./components/AssignmentView";
import { WorkforceSchedule } from "./components/WorkforceSchedule";
import {
  FileText,
  Users,
  Calendar,
} from "lucide-react";

// Types
export interface Person {
  id: string;
  name: string;
  region: string;
  hoursAllocated: number;
  maxHours: number;
  holidays: number;
  skills: string[];
}

export interface Contract {
  id: string;
  vendorName: string;
  region: string;
  hoursRequired: number;
  skillsRequired: string[];
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "completed";
}

export interface Assignment {
  id: string;
  contractId: string;
  personId: string;
  hoursAssigned: number;
}

export interface TimeEntry {
  id: string;
  assignmentId: string;
  personId: string;
  contractId: string;
  date: string;
  hoursClocked: number;
}

// Mock data
const initialPeople: Person[] = [
  {
    id: "1",
    name: "John Smith",
    region: "North",
    hoursAllocated: 15,
    maxHours: 40,
    holidays: 4,
    skills: ["Construction", "Safety"],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    region: "North",
    hoursAllocated: 20,
    maxHours: 40,
    holidays: 4,
    skills: ["Logistics", "Management"],
  },
  {
    id: "3",
    name: "Mike Chen",
    region: "South",
    hoursAllocated: 10,
    maxHours: 40,
    holidays: 4,
    skills: ["IT Support", "Networking"],
  },
  {
    id: "4",
    name: "Emily Davis",
    region: "North",
    hoursAllocated: 0,
    maxHours: 40,
    holidays: 4,
    skills: ["Construction", "Equipment"],
  },
  {
    id: "5",
    name: "James Wilson",
    region: "East",
    hoursAllocated: 25,
    maxHours: 40,
    holidays: 4,
    skills: ["Security", "Safety"],
  },
  {
    id: "6",
    name: "Lisa Anderson",
    region: "South",
    hoursAllocated: 30,
    maxHours: 40,
    holidays: 4,
    skills: ["Cleaning", "Maintenance"],
  },
  {
    id: "7",
    name: "David Brown",
    region: "West",
    hoursAllocated: 5,
    maxHours: 40,
    holidays: 4,
    skills: ["Logistics", "Driving"],
  },
  {
    id: "8",
    name: "Maria Garcia",
    region: "East",
    hoursAllocated: 12,
    maxHours: 40,
    holidays: 4,
    skills: ["IT Support", "Help Desk"],
  },
];

const initialContracts: Contract[] = [
  {
    id: "c0",
    vendorName: "TechSupport Co (Completed)",
    region: "South",
    hoursRequired: 60,
    skillsRequired: ["IT Support", "Networking"],
    startDate: "2025-11-10",
    endDate: "2025-11-23",
    status: "completed",
  },
  {
    id: "c1",
    vendorName: "BuildCo Industries",
    region: "North",
    hoursRequired: 80,
    skillsRequired: ["Construction", "Safety"],
    startDate: "2025-11-24",
    endDate: "2025-12-08",
    status: "active",
  },
  {
    id: "c2",
    vendorName: "FutureTech Systems",
    region: "East",
    hoursRequired: 70,
    skillsRequired: ["Security", "Safety"],
    startDate: "2025-12-09",
    endDate: "2025-12-22",
    status: "pending",
  },
];

const initialAssignments: Assignment[] = [
  // Past completed contract
  {
    id: "a0",
    contractId: "c0",
    personId: "3",
    hoursAssigned: 30,
  },
  {
    id: "a00",
    contractId: "c0",
    personId: "6",
    hoursAssigned: 30,
  },

  // Current contract
  {
    id: "a1",
    contractId: "c1",
    personId: "1",
    hoursAssigned: 25,
  },
  {
    id: "a2",
    contractId: "c1",
    personId: "4",
    hoursAssigned: 35,
  },

  // Future contract
  {
    id: "a3",
    contractId: "c2",
    personId: "5",
    hoursAssigned: 40,
  },
  {
    id: "a4",
    contractId: "c2",
    personId: "8",
    hoursAssigned: 30,
  },
];

// Mock time entries - some with underperformance
const initialTimeEntries: TimeEntry[] = [
  // Past contract (c0) - completed successfully
  {
    id: "t_p1",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-11",
    hoursClocked: 4,
  },
  {
    id: "t_p2",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-12",
    hoursClocked: 4,
  },
  {
    id: "t_p3",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-13",
    hoursClocked: 4,
  },
  {
    id: "t_p4",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-14",
    hoursClocked: 3,
  },
  {
    id: "t_p5",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-15",
    hoursClocked: 3,
  },
  {
    id: "t_p6",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-18",
    hoursClocked: 4,
  },
  {
    id: "t_p7",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-19",
    hoursClocked: 4,
  },
  {
    id: "t_p8",
    assignmentId: "a0",
    personId: "3",
    contractId: "c0",
    date: "2025-11-20",
    hoursClocked: 4,
  },

  {
    id: "t_p9",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-11",
    hoursClocked: 4,
  },
  {
    id: "t_p10",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-12",
    hoursClocked: 4,
  },
  {
    id: "t_p11",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-13",
    hoursClocked: 4,
  },
  {
    id: "t_p12",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-14",
    hoursClocked: 3,
  },
  {
    id: "t_p13",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-15",
    hoursClocked: 3,
  },
  {
    id: "t_p14",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-18",
    hoursClocked: 4,
  },
  {
    id: "t_p15",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-19",
    hoursClocked: 4,
  },
  {
    id: "t_p16",
    assignmentId: "a00",
    personId: "6",
    contractId: "c0",
    date: "2025-11-20",
    hoursClocked: 4,
  },

  // John Smith - underperforming (20 hours clocked vs 25 assigned)
  {
    id: "t1",
    assignmentId: "a1",
    personId: "1",
    contractId: "c1",
    date: "2025-11-25",
    hoursClocked: 3,
  },
  {
    id: "t2",
    assignmentId: "a1",
    personId: "1",
    contractId: "c1",
    date: "2025-11-26",
    hoursClocked: 4,
  },
  {
    id: "t3",
    assignmentId: "a1",
    personId: "1",
    contractId: "c1",
    date: "2025-11-27",
    hoursClocked: 3,
  },
  {
    id: "t4",
    assignmentId: "a1",
    personId: "1",
    contractId: "c1",
    date: "2025-11-28",
    hoursClocked: 4,
  },
  {
    id: "t5",
    assignmentId: "a1",
    personId: "1",
    contractId: "c1",
    date: "2025-11-29",
    hoursClocked: 3,
  },
  // Missing hours for Dec 2-3 (past dates with no entries - should show red)

  // Emily Davis - performing well (35+ hours clocked vs 35 assigned)
  {
    id: "t7",
    assignmentId: "a2",
    personId: "4",
    contractId: "c1",
    date: "2025-11-25",
    hoursClocked: 5,
  },
  {
    id: "t8",
    assignmentId: "a2",
    personId: "4",
    contractId: "c1",
    date: "2025-11-26",
    hoursClocked: 5,
  },
  {
    id: "t9",
    assignmentId: "a2",
    personId: "4",
    contractId: "c1",
    date: "2025-11-27",
    hoursClocked: 5,
  },
  {
    id: "t10",
    assignmentId: "a2",
    personId: "4",
    contractId: "c1",
    date: "2025-11-28",
    hoursClocked: 5,
  },
  {
    id: "t11",
    assignmentId: "a2",
    personId: "4",
    contractId: "c1",
    date: "2025-11-29",
    hoursClocked: 4,
  },
  {
    id: "t12",
    assignmentId: "a2",
    personId: "4",
    contractId: "c1",
    date: "2025-12-02",
    hoursClocked: 5,
  },
  {
    id: "t13",
    assignmentId: "a2",
    personId: "4",
    contractId: "c1",
    date: "2025-12-03",
    hoursClocked: 5,
  },
];

export default function App() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [contracts, setContracts] =
    useState<Contract[]>(initialContracts);
  const [assignments, setAssignments] = useState<Assignment[]>(
    initialAssignments,
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(
    initialTimeEntries,
  );

  const updatePersonHours = (
    personId: string,
    hoursChange: number,
  ) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              hoursAllocated: p.hoursAllocated + hoursChange,
            }
          : p,
      ),
    );
  };

  const autoAssignContract = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    // Find eligible people (same region, available hours, matching skills)
    const eligiblePeople = people
      .filter(
        (p) =>
          p.region === contract.region &&
          p.hoursAllocated < p.maxHours &&
          contract.skillsRequired.some((skill) =>
            p.skills.includes(skill),
          ),
      )
      .sort((a, b) => a.hoursAllocated - b.hoursAllocated);

    let remainingHours = contract.hoursRequired;
    const newAssignments: Assignment[] = [];

    for (const person of eligiblePeople) {
      if (remainingHours <= 0) break;

      const availableHours =
        person.maxHours - person.hoursAllocated;
      const hoursToAssign = Math.min(
        remainingHours,
        availableHours,
      );

      if (hoursToAssign > 0) {
        const assignmentId = `a${Date.now()}_${person.id}`;
        newAssignments.push({
          id: assignmentId,
          contractId: contract.id,
          personId: person.id,
          hoursAssigned: hoursToAssign,
        });

        updatePersonHours(person.id, hoursToAssign);
        remainingHours -= hoursToAssign;
      }
    }

    setAssignments((prev) => [...prev, ...newAssignments]);

    // Update contract status
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status:
                remainingHours === 0 ? "active" : "pending",
            }
          : c,
      ),
    );
  };

  const addContract = (contract: Contract) => {
    setContracts((prev) => [...prev, contract]);
    // Auto-assign immediately
    setTimeout(() => autoAssignContract(contract.id), 100);
  };

  const updateAssignment = (
    assignmentId: string,
    newHours: number,
  ) => {
    const assignment = assignments.find(
      (a) => a.id === assignmentId,
    );
    if (!assignment) return;

    const hoursDiff = newHours - assignment.hoursAssigned;

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? { ...a, hoursAssigned: newHours }
          : a,
      ),
    );

    updatePersonHours(assignment.personId, hoursDiff);
  };

  const deleteAssignment = (assignmentId: string) => {
    const assignment = assignments.find(
      (a) => a.id === assignmentId,
    );
    if (!assignment) return;

    updatePersonHours(
      assignment.personId,
      -assignment.hoursAssigned,
    );
    setAssignments((prev) =>
      prev.filter((a) => a.id !== assignmentId),
    );
  };

  const addManualAssignment = (
    contractId: string,
    personId: string,
    hours: number,
  ) => {
    const assignmentId = `a${Date.now()}_${personId}`;
    setAssignments((prev) => [
      ...prev,
      {
        id: assignmentId,
        contractId,
        personId,
        hoursAssigned: hours,
      },
    ]);
    updatePersonHours(personId, hours);
  };

  const addTimeEntry = (entry: Omit<TimeEntry, "id">) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: `t${Date.now()}`,
    };
    setTimeEntries((prev) => [...prev, newEntry]);
  };

  const updateTimeEntry = (
    entryId: string,
    hoursClocked: number,
  ) => {
    setTimeEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, hoursClocked } : e,
      ),
    );
  };

  const deleteTimeEntry = (entryId: string) => {
    setTimeEntries((prev) =>
      prev.filter((e) => e.id !== entryId),
    );
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - Full Width */}
      <div className="w-full border-b" style={{ backgroundColor: '#172240' }}>
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <h1 className="text-white mb-2">SamhallSchedules</h1>
          <p className="text-white/80">
            Intelligent contract-based workforce allocation system
          </p>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="w-full flex border-b-2 border-gray-200 -mx-6 px-6 h-auto bg-transparent rounded-none p-0">
            <TabsTrigger
              value="contracts"
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-transparent shadow-none border-b-4 border-transparent rounded-none py-3 sm:py-4 px-2 sm:px-4 transition-all hover:bg-gray-50"
            >
              <FileText className="size-4 sm:size-4" />
              <span className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Contracts</span>
                <span className="sm:hidden">Contract</span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="workforce"
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-transparent shadow-none border-b-4 border-transparent rounded-none py-3 sm:py-4 px-2 sm:px-4 transition-all hover:bg-gray-50"
            >
              <Users className="size-4 sm:size-4" />
              <span className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Workforce</span>
                <span className="sm:hidden">Staff</span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-transparent shadow-none border-b-4 border-transparent rounded-none py-3 sm:py-4 px-2 sm:px-4 transition-all hover:bg-gray-50"
            >
              <Calendar className="size-4 sm:size-4" />
              <span className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Assignments</span>
                <span className="sm:hidden">Assign</span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="space-y-4">
            <ContractManagement
              contracts={contracts}
              onAddContract={addContract}
            />
          </TabsContent>

          <TabsContent value="workforce" className="space-y-4">
            <WorkforceSchedule
              contracts={contracts}
              people={people}
              assignments={assignments}
              timeEntries={timeEntries}
              onAddTimeEntry={addTimeEntry}
              onUpdateTimeEntry={updateTimeEntry}
              onDeleteTimeEntry={deleteTimeEntry}
            />
          </TabsContent>

          <TabsContent
            value="assignments"
            className="space-y-4"
          >
            <AssignmentView
              contracts={contracts}
              people={people}
              assignments={assignments}
              onUpdateAssignment={updateAssignment}
              onDeleteAssignment={deleteAssignment}
              onAddAssignment={addManualAssignment}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}