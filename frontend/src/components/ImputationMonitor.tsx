import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";

const imputationData = [
  { dataType: "Voltage", cyberSamples: 1000, physicalSamples: 980, matched: 975, rate: 97.5 },
  { dataType: "Current", cyberSamples: 1000, physicalSamples: 995, matched: 990, rate: 99.0 },
  { dataType: "Power", cyberSamples: 1000, physicalSamples: 990, matched: 985, rate: 98.5 },
  { dataType: "Frequency", cyberSamples: 1000, physicalSamples: 1000, matched: 998, rate: 99.8 },
];

const fusionQuality = [
  { timestamp: "00:00", cyberData: 95, physicalData: 92, fusedData: 94 },
  { timestamp: "04:00", cyberData: 88, physicalData: 90, fusedData: 92 },
  { timestamp: "08:00", cyberData: 93, physicalData: 94, fusedData: 96 },
  { timestamp: "12:00", cyberData: 91, physicalData: 89, fusedData: 93 },
  { timestamp: "16:00", cyberData: 94, physicalData: 96, fusedData: 98 },
  { timestamp: "20:00", cyberData: 92, physicalData: 91, fusedData: 95 },
];

export function ImputationMonitor() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Cyber-Physical Data Fusion Monitor</h2>
        <p className="text-muted-foreground">Real-time imputation and attribute vector formation</p>
      </div>

      {/* Fusion Status */}
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Status</span>
            <Badge className="bg-green-600">ACTIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-semibold">Attribute Vector Formation: X = [X_c, X_p]</p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-background border border-green-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Cyber Features (X_c)</p>
              <p className="font-bold text-lg mt-1">12 dimensions</p>
              <p className="text-xs text-green-600 mt-1">Network packet rate, protocol counts, anomalies</p>
            </div>
            <div className="p-3 bg-background border border-blue-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Physical Features (X_p)</p>
              <p className="font-bold text-lg mt-1">8 dimensions</p>
              <p className="text-xs text-blue-600 mt-1">Voltage, current, power, frequency</p>
            </div>
            <div className="p-3 bg-background border border-purple-500/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Fused Vector</p>
              <p className="font-bold text-lg mt-1">20D Space</p>
              <p className="text-xs text-purple-600 mt-1">Complete node attribute representation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imputation Rate by Data Type */}
      <Card>
        <CardHeader>
          <CardTitle>Data Type Imputation Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={imputationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dataType" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#00ff00" name="Match Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Imputation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Imputation Details by Data Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {imputationData.map((item) => (
              <div key={item.dataType} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{item.dataType}</h4>
                  <Badge className="bg-green-600">{item.rate}%</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cyber Samples</p>
                    <p className="font-bold">{item.cyberSamples}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Physical Samples</p>
                    <p className="font-bold">{item.physicalSamples}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Matched Rows</p>
                    <p className="font-bold">{item.matched}</p>
                  </div>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: `${item.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fusion Quality Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Data Fusion Quality Timeline (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fusionQuality}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cyberData" stroke="#00ff00" name="Cyber Data Quality %" />
              <Line type="monotone" dataKey="physicalData" stroke="#0088ff" name="Physical Data Quality %" />
              <Line type="monotone" dataKey="fusedData" stroke="#7c3aff" name="Fused Data Quality %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fusion Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cyber Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">99.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Collection success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Physical Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">97.8%</div>
            <p className="text-xs text-muted-foreground mt-1">Collection success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Imputation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">98.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Row matching success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vector Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">95.3%</div>
            <p className="text-xs text-muted-foreground mt-1">Complete 20D attributes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
