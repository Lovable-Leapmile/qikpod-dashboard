
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Eye, EyeOff, Edit, Trash2, Settings, Update } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, PodDetail as PodDetailType, LogEntry } from '@/services/dashboardApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NoDataIllustration from '@/components/ui/no-data-illustration';
import EditModePopup from './EditModePopup';
import UpdatePodVersionPopup from './UpdatePodVersionPopup';
import FEUpdatePopup from './FEUpdatePopup';

interface PodDetailProps {
  podId: number;
  onBack: () => void;
}

const PodDetail: React.FC<PodDetailProps> = ({ podId, onBack }) => {
  const { accessToken } = useAuth();
  const [podDetail, setPodDetail] = useState<PodDetailType | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [showHiddenSection, setShowHiddenSection] = useState(false);
  const [showEditModePopup, setShowEditModePopup] = useState(false);
  const [showUpdateVersionPopup, setShowUpdateVersionPopup] = useState(false);
  const [showFEUpdatePopup, setShowFEUpdatePopup] = useState(false);

  const fetchPodDetail = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getPodDetail(accessToken, podId);
      setPodDetail(data);
    } catch (error) {
      console.error('Error fetching pod detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (!accessToken) return;
    setLogsLoading(true);
    try {
      const data = await dashboardApi.getPodLogs(accessToken, podId);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching pod logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodDetail();
    fetchLogs();
  }, [podId, accessToken]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === 'null' || value === '') {
      return 'N/A';
    }
    return String(value);
  };

  const getPodStatus = (status: string) => {
    return status === 'success' ? 'Active' : 'Inactive';
  };

  const handlePopupSuccess = () => {
    fetchPodDetail();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pods</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading pod details...</p>
        </div>
      </div>
    );
  }

  if (!podDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pods</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Pod not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pods</span>
        </Button>
      </div>

      {/* Pod Details Card */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-6 pt-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-32 h-40 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <img 
                  src="/lovable-uploads/10ae1ee2-d8e4-4863-8041-f983e231b5a3.png" 
                  alt="Qikpod Logo"
                  className="w-20 h-auto"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                  {podDetail.pod_name}
                </CardTitle>
                
                {/* Pod Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">POD NAME:</span>
                    <span className="ml-4 text-gray-900">{formatValue(podDetail.pod_name)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">POD ID:</span>
                    <span className="ml-4 text-gray-900">{formatValue(podDetail.id)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">TOTAL DOORS:</span>
                    <span className="ml-4 text-gray-900">{formatValue(podDetail.pod_numtotaldoors)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">LOCATION:</span>
                    <span className="ml-4 text-gray-900">{formatValue(podDetail.location_name)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">CREATED AT:</span>
                    <span className="ml-4 text-gray-900">{formatValue(podDetail.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">UPDATED AT:</span>
                    <span className="ml-4 text-gray-900">{formatValue(podDetail.updated_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">PINGED AT:</span>
                    <span className="ml-4 text-gray-900">{formatValue(podDetail.pinged_at)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">STATUS:</span>
                    <span className="ml-4 text-gray-900">{getPodStatus(podDetail.status)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="rounded-lg"
                onClick={() => setShowEditModePopup(true)}
              >
                Edit Mode
              </Button>
              <Button 
                variant="outline" 
                className="rounded-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="rounded-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Touchless</span>
                <Switch checked={podDetail.pod_touchless_enabled} />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-8">
          {/* Pod Versions Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pod Versions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-600 font-medium">HEALTH:</span>
                <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_health)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">STATE:</span>
                <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_state)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">POWER:</span>
                <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_power_status)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">CURRENT:</span>
                <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_production_version)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">TARGET:</span>
                <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_production_version_update_to)}</span>
              </div>
            </div>

            {/* Hide/Show Toggle */}
            <Button
              variant="ghost"
              onClick={() => setShowHiddenSection(!showHiddenSection)}
              className="flex items-center space-x-2 text-gray-600 mb-4"
            >
              {showHiddenSection ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showHiddenSection ? 'See Less' : 'See More'}</span>
            </Button>

            {/* Additional Details (Hidden by default) */}
            {showHiddenSection && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm border-t pt-6">
                <div>
                  <span className="text-gray-600 font-medium">MODE:</span>
                  <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_mode)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">CONFIGURATION VERSION:</span>
                  <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_configuration_version)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">ROOT VERSION:</span>
                  <span className="ml-2 text-gray-900">{formatValue(podDetail.pod_root_version)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">FE TAG:</span>
                  <span className="ml-2 text-gray-900">{formatValue(podDetail.fe_tag)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">FE DETAILS:</span>
                  <span className="ml-2 text-gray-900">{formatValue(podDetail.fe_details)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Section */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">Logs</CardTitle>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-lg"
                onClick={() => setShowUpdateVersionPopup(true)}
              >
                <Update className="w-4 h-4 mr-2" />
                Update Pod Version
              </Button>
              <Button 
                variant="outline" 
                className="rounded-lg"
                onClick={() => setShowFEUpdatePopup(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                FE Update
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <NoDataIllustration 
              title="No logs found"
              description="There are no logs available for this pod."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Log ID</TableHead>
                    <TableHead>Log Time</TableHead>
                    <TableHead>Log Type</TableHead>
                    <TableHead>Log Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.log_id}>
                      <TableCell>{log.log_id}</TableCell>
                      <TableCell>{formatValue(log.updated_at)}</TableCell>
                      <TableCell>{formatValue(log.log_type)}</TableCell>
                      <TableCell>{formatValue(log.log_message)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popups */}
      <EditModePopup
        open={showEditModePopup}
        onOpenChange={setShowEditModePopup}
        podId={podId}
        initialValue={podDetail.pod_mode}
        onSuccess={handlePopupSuccess}
      />

      <UpdatePodVersionPopup
        open={showUpdateVersionPopup}
        onOpenChange={setShowUpdateVersionPopup}
        podId={podId}
        onSuccess={handlePopupSuccess}
      />

      <FEUpdatePopup
        open={showFEUpdatePopup}
        onOpenChange={setShowFEUpdatePopup}
        podId={podId}
        initialValues={{
          fe_tag: podDetail.fe_tag,
          fe_details: podDetail.fe_details,
        }}
        onSuccess={handlePopupSuccess}
      />
    </div>
  );
};

export default PodDetail;
