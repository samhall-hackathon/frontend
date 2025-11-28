import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Upload, Plus, Building2, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Contract } from '../App';

interface ContractManagementProps {
  contracts: Contract[];
  onAddContract: (contract: Contract) => void;
}

export function ContractManagement({ contracts, onAddContract }: ContractManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState({
    vendorName: '',
    region: 'North',
    hoursRequired: '',
    skillsRequired: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contract: Contract = {
      id: `c${Date.now()}`,
      vendorName: newContract.vendorName,
      region: newContract.region,
      hoursRequired: parseInt(newContract.hoursRequired),
      skillsRequired: newContract.skillsRequired.split(',').map(s => s.trim()),
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      status: 'pending'
    };

    onAddContract(contract);
    setIsDialogOpen(false);
    setNewContract({
      vendorName: '',
      region: 'North',
      hoursRequired: '',
      skillsRequired: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate contract parsing from file
      const mockContract: Contract = {
        id: `c${Date.now()}`,
        vendorName: `Vendor from ${file.name}`,
        region: 'South',
        hoursRequired: 60,
        skillsRequired: ['IT Support', 'Networking'],
        startDate: '2025-11-25',
        endDate: '2025-12-09',
        status: 'pending'
      };
      onAddContract(mockContract);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Contract</CardTitle>
          <CardDescription>Upload vendor contract documents for automatic parsing and assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="size-4" />
                  Add Manually
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Contract</DialogTitle>
                  <DialogDescription>Enter contract details manually for assignment</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name</Label>
                    <Input
                      id="vendorName"
                      value={newContract.vendorName}
                      onChange={(e) => setNewContract({ ...newContract, vendorName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select 
                      value={newContract.region} 
                      onValueChange={(value) => setNewContract({ ...newContract, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North">North</SelectItem>
                        <SelectItem value="South">South</SelectItem>
                        <SelectItem value="East">East</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoursRequired">Hours Required (2 weeks)</Label>
                    <Input
                      id="hoursRequired"
                      type="number"
                      value={newContract.hoursRequired}
                      onChange={(e) => setNewContract({ ...newContract, hoursRequired: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills Required (comma-separated)</Label>
                    <Input
                      id="skills"
                      value={newContract.skillsRequired}
                      onChange={(e) => setNewContract({ ...newContract, skillsRequired: e.target.value })}
                      placeholder="e.g. Construction, Safety, Management"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newContract.startDate}
                        onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newContract.endDate}
                        onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Create Contract</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-slate-900">Active Contracts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="size-5 text-blue-600" />
                      {contract.vendorName}
                    </CardTitle>
                    <CardDescription>Contract ID: {contract.id}</CardDescription>
                  </div>
                  <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                    {contract.status === 'active' ? (
                      <CheckCircle className="size-3 mr-1" />
                    ) : (
                      <AlertCircle className="size-3 mr-1" />
                    )}
                    {contract.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="size-4" />
                  <span>Region: {contract.region}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="size-4" />
                  <span>{contract.hoursRequired} hours required</span>
                </div>
                <div>
                  <p className="text-slate-600 mb-2">Skills Required:</p>
                  <div className="flex flex-wrap gap-2">
                    {contract.skillsRequired.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t text-slate-500">
                  <p>{new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
