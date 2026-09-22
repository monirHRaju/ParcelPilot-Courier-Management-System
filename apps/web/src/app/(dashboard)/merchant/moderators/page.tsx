'use client';

import { useState } from 'react';
import { Users, UserPlus, Shield, Trash2, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ModeratorsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OPERATOR');

  const [moderators, setModerators] = useState([
    { id: '1', name: 'Al-Amin Hosain', email: 'alamin@prokriti.com', phone: '01711223344', role: 'STORE_MANAGER', status: 'ACTIVE' },
    { id: '2', name: 'Farzana Akter', email: 'farzana@prokriti.com', phone: '01899887766', role: 'ORDER_PACKER', status: 'ACTIVE' },
  ]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setModerators([
      ...moderators,
      { id: String(Date.now()), name, email, phone: '01XXXXXXXXX', role, status: 'ACTIVE' }
    ]);
    setName('');
    setEmail('');
  };

  const handleDelete = (id: string) => {
    setModerators(moderators.filter(m => m.id !== id));
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Users className="text-primary" size={26} />
          Store Moderators & Staff Access
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Delegate parcel creation, label printing, and tracking privileges to team members without sharing passwords.
        </p>
      </div>

      {/* Add Moderator Form */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Invite New Staff Member</CardTitle>
          <CardDescription className="text-xs">Staff will receive login credentials via email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Staff Name</label>
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Staff Email</label>
              <Input
                type="email"
                placeholder="staff@store.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Role / Permission</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="OPERATOR">Operator (Add parcels & track)</option>
                <option value="STORE_MANAGER">Manager (Full store access)</option>
                <option value="ORDER_PACKER">Packer (Labels & print only)</option>
              </select>
            </div>

            <div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 rounded-xl">
                <UserPlus size={15} className="mr-1.5" /> Invite Staff
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold">Staff Member</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Access Level</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moderators.map(mod => (
              <TableRow key={mod.id}>
                <TableCell>
                  <div className="font-semibold text-xs text-foreground">{mod.name}</div>
                  <div className="text-[11px] text-muted-foreground">{mod.phone}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{mod.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-medium">
                    {mod.role.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(mod.id)} 
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-full"
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
