import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NoDataIllustration from '@/components/ui/no-data-illustration';
import UpdatePodVersionPopup from '@/components/UpdatePodVersionPopup';
import FeUpdatePopup from '@/components/FeUpdatePopup';
import { ArrowLeft, Package, Upload, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dashboardApi, PodDetail as PodDetailType, PodLog } from '@/services/dashboardApi';
interface PodDetailProps {
  podId: number;
  onBack: () => void;
}
const PodDetail: React.FC<PodDetailProps> = ({
  podId,
  onBack
}) => {
  const {
    accessToken
  } = useAuth();
  const {
    toast
  } = useToast();
  const [podDetail, setPodDetail] = useState<PodDetailType | null>(null);
  const [logs, setLogs] = useState<PodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVersionPopup, setShowVersionPopup] = useState(false);
  const [showFePopup, setShowFePopup] = useState(false);
  const fetchPodDetail = async () => {
    if (!accessToken) return;
    try {
      setIsLoading(true);
      const [podData, logsData] = await Promise.all([dashboardApi.getPodDetail(accessToken, podId), dashboardApi.getPodLogs(accessToken, podId, 50)]);
      setPodDetail(podData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching pod details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pod details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchPodDetail();
  }, [podId, accessToken]);
  const handleRefresh = () => {
    fetchPodDetail();
  };
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };
  const getStatusDisplay = (status: string) => {
    return status?.toLowerCase() === 'success' ? 'Active' : 'Inactive';
  };
  const getStatusColor = (status: string) => {
    return status?.toLowerCase() === 'success' ? 'text-green-600' : 'text-red-600';
  };
  if (isLoading) {
    return <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pods</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Pod Details</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading pod details...</p>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pods</span>
        </Button>
        
      </div>

      {podDetail ? <>
          {/* Pod Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-yellow-500" />
                {podDetail.pod_name} - ID: {podDetail.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <p className={`font-semibold ${getStatusColor(podDetail.status)}`}>
                    {getStatusDisplay(podDetail.status)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location</span>
                  <p className="font-medium">{podDetail.location_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Total Doors</span>
                  <p className="font-medium">{podDetail.pod_numtotaldoors}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Connection Method</span>
                  <p className="font-medium">{podDetail.pod_connection_method}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">IP Address</span>
                  <p className="font-medium">{podDetail.pod_ip_address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">MAC Address</span>
                  <p className="font-medium">{podDetail.pod_mac_address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">SIM Number</span>
                  <p className="font-medium">{podDetail.sim_number}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">IMEI</span>
                  <p className="font-medium">{podDetail.imei}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Payment Mode</span>
                  <p className="font-medium capitalize">{podDetail.payment_mode}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Pinged</span>
                  <p className="font-medium">{formatDate(podDetail.pinged_at)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Uptime</span>
                  <p className="font-medium">{podDetail.uptime}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">WiFi SSID</span>
                  <p className="font-medium">{podDetail.pod_wifi_ssid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={() => setShowVersionPopup(true)} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black">
              <Upload className="w-4 h-4 mr-2" />
              Update Pod Version
            </Button>
            <Button onClick={() => setShowFePopup(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              FE Update
            </Button>
          </div>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="font-semibold">Log ID</TableHead>
                        <TableHead className="font-semibold">Log Time</TableHead>
                        <TableHead className="font-semibold">Log Type</TableHead>
                        <TableHead className="font-semibold">Log Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log, index) => <TableRow key={log.log_id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-100/50 transition-colors`}>
                          <TableCell className="py-3">{log.log_id}</TableCell>
                          <TableCell className="py-3">{formatDate(log.updated_at)}</TableCell>
                          <TableCell className="py-3">{log.log_type}</TableCell>
                          <TableCell className="py-3">{log.log_message}</TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div> : <NoDataIllustration title="No logs found" description="There are no logs available for this pod." />}
            </CardContent>
          </Card>

          {/* Popups */}
          <UpdatePodVersionPopup open={showVersionPopup} onOpenChange={setShowVersionPopup} podId={podId} onSuccess={handleRefresh} />

          <FeUpdatePopup open={showFePopup} onOpenChange={setShowFePopup} podId={podId} onSuccess={handleRefresh} />
        </> : <Card>
          <CardContent>
            <NoDataIllustration title="Pod not found" description="The requested pod could not be found." />
          </CardContent>
        </Card>}
    </div>;
};
export default PodDetail;