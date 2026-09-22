'use client';

import { useState } from 'react';
import { Printer, FileUp, Download, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BulkPrintPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
      setImported(true);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Printer className="text-primary" size={26} />
          Bulk Printing & Batch Import
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate thermal stickers, 4x6 packaging slips, and bulk upload Excel consignment sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Print Labels */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Batch Label Generation</CardTitle>
            <CardDescription className="text-xs">
              Print thermal barcodes & invoices for all pending parcels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Today's Ready Consignments</p>
                <p className="text-xs text-muted-foreground">12 parcels awaiting packaging labels</p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">12 Ready</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={() => alert('Printing standard A4 4-per-page labels')} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs h-10"
              >
                <Printer size={15} className="mr-1.5" /> Print A4 Labels
              </Button>
              <Button 
                onClick={() => alert('Downloading thermal 4x6 inch label roll')} 
                variant="outline" 
                className="w-full rounded-xl text-xs h-10 border-border"
              >
                <Download size={15} className="mr-1.5" /> Thermal 4x6"
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Excel Import */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Excel Consignment Upload</CardTitle>
            <CardDescription className="text-xs">
              Upload spreadsheets to book hundreds of parcels in one click
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
              <FileSpreadsheet className="text-primary" size={32} />
              <p className="text-xs font-semibold text-foreground">
                {selectedFile || 'Click or drag Excel / CSV file here'}
              </p>
              <p className="text-[11px] text-muted-foreground">Supports .xlsx, .xls, .csv format</p>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
            </label>

            {imported && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>Uploaded "{selectedFile}". 24 orders extracted successfully.</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-muted-foreground">Need the correct column format?</span>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Template downloaded.'); }} className="text-primary font-semibold hover:underline">
                Download Template.xlsx
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
