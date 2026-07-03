import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Sparkles,
  Activity,
  Users,
  CreditCard,
  ArrowUpRight,
  Search,
  Bell,
  Shield,
  Moon,
  Sun,
  Laptop,
  Command,
  Mail,
  Lock,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export const Route = createFileRoute('/demo')({
  component: Demo,
});

// Custom Github SVG Icon
const GithubIcon = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
  </svg>
);

function Demo() {
  const [notifications, setNotifications] = useState(true);
  const [securityEmails, setSecurityEmails] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState('willshop2');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsSignedIn(true);
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setEmail('');
    setPassword('');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-border bg-radial-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Introducing shadcn-ui + Base-UI Showcase</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Build your user interface <br />
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              beautifully, with speed.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A premium playground demonstrating Shadcn components built on top of TanStack Start and Convex. Interact
            with themes, forms, and analytical dashboards in real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-10 px-6 font-semibold shadow-md">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="h-10 px-6 font-semibold shadow-sm">
              <GithubIcon className="mr-2 h-4 w-4" /> View Source
            </Button>
          </div>
        </div>
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </section>

      {/* Dashboard Preview Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Analytics Card Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +20.1%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +180.1%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sales Volume</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +19.0%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-emerald-500 font-semibold">+201</span>
                since last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Column 1: Interactive Authentication */}
          <div className="space-y-8 lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Sign In Account</CardTitle>
                <CardDescription>Enter your email and password to access the app demo.</CardDescription>
              </CardHeader>
              <CardContent>
                {isSignedIn ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">Successfully Signed In</h3>
                    <p className="text-sm text-muted-foreground break-all">{email || 'user@example.com'}</p>
                    <Button variant="outline" className="w-full mt-4" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="signin-email"
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-9"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="signin-password"
                          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                          Password
                        </label>
                        <a href="#" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Sign In with Email
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2 justify-center border-t border-border bg-muted/30 py-4">
                <div className="relative w-full flex items-center justify-center my-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"></span>
                  </div>
                  <span className="relative bg-background px-2 text-xs uppercase text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    variant="outline"
                    className="h-9"
                    onClick={() => {
                      setEmail('google.user@gmail.com');
                      setIsSignedIn(true);
                    }}
                  >
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9"
                    onClick={() => {
                      setEmail('github.dev@github.com');
                      setIsSignedIn(true);
                    }}
                  >
                    GitHub
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Column 2: Dashboard Metrics & Sales */}
          <div className="space-y-8 lg:col-span-2 grid gap-8">
            {/* Sales Table Card */}
            <Card className="shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>You made 265 sales this month.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  View All <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Sales Item 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        OM
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Olivia Martin</p>
                        <p className="text-xs text-muted-foreground">olivia.martin@email.com</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-right text-emerald-500">+$1,999.00</div>
                  </div>

                  {/* Sales Item 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-violet-500/10 text-violet-600 font-bold text-xs flex items-center justify-center">
                        JL
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Jackson Lee</p>
                        <p className="text-xs text-muted-foreground">jackson.lee@email.com</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-right text-emerald-500">+$39.00</div>
                  </div>

                  {/* Sales Item 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center">
                        IN
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">Isabella Nguyen</p>
                        <p className="text-xs text-muted-foreground">isabella.nguyen@email.com</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-right text-emerald-500">+$299.00</div>
                  </div>

                  {/* Sales Item 4 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">
                        WK
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">William Kim</p>
                        <p className="text-xs text-muted-foreground">will@email.com</p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-right text-emerald-500">+$99.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Column 3 Settings Panel inside Column 2 Grid */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure notifications and theme properties.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Push Notifications</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Receive real-time alerts on active sales.</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">Security Alerts</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Receive security audit log emails weekly.</p>
                  </div>
                  <Switch checked={securityEmails} onCheckedChange={setSecurityEmails} />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Application Theme
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
