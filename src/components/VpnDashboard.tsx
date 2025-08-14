import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  Server, 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Settings,
  Activity,
  Globe,
  Lock,
  Wifi,
  AlertCircle,
  CheckCircle,
  QrCode
} from "lucide-react";

interface VpnUser {
  id: string;
  name: string;
  publicKey: string;
  allowedIPs: string;
  endpoint?: string;
  lastHandshake?: Date;
  transferRx: number;
  transferTx: number;
  status: 'connected' | 'disconnected';
}

interface ServerStats {
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  totalUsers: number;
  activeConnections: number;
  totalTransfer: {
    rx: number;
    tx: number;
  };
  publicKey: string;
  endpoint: string;
  port: number;
}

const VpnDashboard = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionIP, setConnectionIP] = useState('');
  const [serverStats, setServerStats] = useState<ServerStats>({
    status: 'running',
    uptime: '5d 12h 30m',
    totalUsers: 5,
    activeConnections: 3,
    totalTransfer: { rx: 2.5, tx: 1.8 },
    publicKey: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz=',
    endpoint: 'vpn.yourdomain.com',
    port: 51820
  });

  const [users, setUsers] = useState<VpnUser[]>([
    {
      id: '1',
      name: 'Admin Desktop',
      publicKey: 'ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234=',
      allowedIPs: '10.8.0.2/32',
      lastHandshake: new Date(Date.now() - 300000),
      transferRx: 1.2,
      transferTx: 0.8,
      status: 'connected'
    },
    {
      id: '2', 
      name: 'Mobile Phone',
      publicKey: 'XYZ987UVW654RST321PON098MLK765IHG432FED109CBA876=',
      allowedIPs: '10.8.0.3/32',
      lastHandshake: new Date(Date.now() - 60000),
      transferRx: 0.5,
      transferTx: 0.3,
      status: 'connected'
    },
    {
      id: '3',
      name: 'Laptop Work',
      publicKey: 'QWE456RTY789UIO012PAS345DFG678HJK901LZX234CVB567=',
      allowedIPs: '10.8.0.4/32',
      lastHandshake: new Date(Date.now() - 7200000),
      transferRx: 0.8,
      transferTx: 0.7,
      status: 'disconnected'
    }
  ]);

  const [newUserName, setNewUserName] = useState('');
  const [showServerKey, setShowServerKey] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VpnUser | null>(null);

  const addUser = () => {
    if (!newUserName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    const newUser: VpnUser = {
      id: Date.now().toString(),
      name: newUserName,
      publicKey: `NEW${Math.random().toString(36).substring(7).toUpperCase()}KEY=`,
      allowedIPs: `10.8.0.${users.length + 5}/32`,
      transferRx: 0,
      transferTx: 0,
      status: 'disconnected'
    };

    setUsers([...users, newUser]);
    setNewUserName('');
    toast({
      title: "User Added",
      description: `Successfully created VPN user: ${newUserName}`
    });
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Removed", 
      description: "VPN user has been deleted"
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes * 1024 * 1024) / Math.log(k));
    return parseFloat(((bytes * 1024 * 1024) / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'connected':
        return 'bg-accent text-accent-foreground';
      case 'disconnected':
        return 'bg-muted text-muted-foreground';
      case 'error':
      case 'stopped':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleConnect = () => {
    setIsConnected(!isConnected);
    if (!isConnected) {
      // Simulate getting a new IP from VPN server
      const vpnIPs = ['185.234.72.54', '194.135.83.19', '146.70.95.32', '198.211.45.67'];
      setConnectionIP(vpnIPs[Math.floor(Math.random() * vpnIPs.length)]);
      toast({
        title: "Connected to VPN", 
        description: "Your connection is now secure and anonymous"
      });
    } else {
      setConnectionIP('');
      toast({
        title: "Disconnected from VPN",
        description: "You are now using your regular internet connection"
      });
    }
  };

  const generateClientConfig = (user: VpnUser) => {
    return `[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = ${user.allowedIPs}
DNS = 1.1.1.1, 1.0.0.1
MTU = 1420

[Peer]
PublicKey = ${serverStats.publicKey}
Endpoint = ${serverStats.endpoint}:${serverStats.port}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              VPN Fortress
            </h1>
            <p className="text-muted-foreground">Self-hosted secure VPN management</p>
            {isConnected && connectionIP && (
              <p className="text-sm text-accent font-medium mt-1">
                ✓ Connected via {connectionIP}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleConnect}
              className={isConnected ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}
              size="lg"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Disconnect
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
            <Badge className={getStatusColor(serverStats.status)}>
              {serverStats.status === 'running' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {serverStats.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Server Uptime</p>
                  <p className="text-lg font-semibold">{serverStats.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-lg font-semibold">{serverStats.activeConnections}/{serverStats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Data Transfer</p>
                  <p className="text-lg font-semibold">↓{formatBytes(serverStats.totalTransfer.rx)} ↑{formatBytes(serverStats.totalTransfer.tx)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Endpoint</p>
                  <p className="text-lg font-semibold">{serverStats.endpoint}:{serverStats.port}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="server">Server Config</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  VPN Users
                </CardTitle>
                <CardDescription>
                  Manage VPN user accounts and generate client configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New User */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter username"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addUser}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>

                <Separator />

                {/* Users List */}
                <div className="space-y-3">
                  {users.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{user.name}</h3>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">IP: {user.allowedIPs}</p>
                          {user.lastHandshake && (
                            <p className="text-xs text-muted-foreground">
                              Last seen: {user.lastHandshake.toLocaleString()}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Transfer: ↓{formatBytes(user.transferRx)} ↑{formatBytes(user.transferTx)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <QrCode className="h-4 w-4 mr-2" />
                                Config
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Client Configuration - {user.name}</DialogTitle>
                                <DialogDescription>
                                  Use this configuration to connect to the VPN
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>WireGuard Configuration</Label>
                                  <div className="relative">
                                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                      {generateClientConfig(user)}
                                    </pre>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="absolute top-2 right-2"
                                      onClick={() => copyToClipboard(generateClientConfig(user), 'Configuration')}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button>
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Show QR Code
                                  </Button>
                                  <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download .conf
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Server Tab */}
          <TabsContent value="server" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Server Configuration
                </CardTitle>
                <CardDescription>
                  View and manage WireGuard server settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Server Public Key</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type={showServerKey ? "text" : "password"}
                        value={serverStats.publicKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowServerKey(!showServerKey)}
                      >
                        {showServerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(serverStats.publicKey, 'Server public key')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Server Endpoint</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={`${serverStats.endpoint}:${serverStats.port}`}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${serverStats.endpoint}:${serverStats.port}`, 'Server endpoint')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Server Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      <Activity className="h-4 w-4 mr-2" />
                      Restart Server
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Config
                    </Button>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Regenerate Keys
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Server Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time server statistics and connection monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Connection Status</h3>
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${user.status === 'connected' ? 'bg-accent' : 'bg-muted-foreground'}`} />
                            <span className="font-medium">{user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {user.allowedIPs}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.status === 'connected' ? (
                              user.lastHandshake ? `Active ${Math.floor((Date.now() - user.lastHandshake.getTime()) / 60000)}m ago` : 'Active now'
                            ) : (
                              'Disconnected'
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Security Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Encryption</p>
                          <p className="text-sm text-muted-foreground">ChaCha20-Poly1305</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">DNS Protection</p>
                          <p className="text-sm text-muted-foreground">DNS-over-HTTPS Active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">IPv6 Support</p>
                          <p className="text-sm text-muted-foreground">Enabled</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Kill Switch</p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VpnDashboard;