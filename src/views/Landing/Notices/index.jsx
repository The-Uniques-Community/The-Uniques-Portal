
import  React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Bell,
  Calendar,
  Tag,
  Clock,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Code,
  Layers,
  BarChart,
  Users,
  Bookmark,
  FileText,
  Zap,
  Settings,
  List,
} from "lucide-react"

const index = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [expandedNotice, setExpandedNotice] = useState(null)
  const [savedNotices, setSavedNotices] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState("card") // card or compact
  const [darkMode, setDarkMode] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false)

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const notices = [
    {
      id: 1,
      title: "Technical Workshop: Advanced Machine Learning",
      category: "technical",
      priority: "high",
      date: "2025-03-15",
      time: "10:00 AM - 2:00 PM EST",
      location: "Virtual Meeting",
      content:
        "Join our expert-led workshop on advanced machine learning techniques. This hands-on session will cover neural networks, deep learning frameworks, and practical implementation strategies for real-world applications.",
      registrationLink: "#",
      attachments: ["workshop-materials.zip", "prerequisites.pdf"],
      isNew: true,
      instructor: "Dr. Sarah Chen",
      instructorAvatar: "/placeholder.svg?height=40&width=40",
      prerequisites: ["Basic Python knowledge", "Understanding of ML fundamentals"],
      techStack: ["TensorFlow", "PyTorch", "Scikit-learn"],
      completionRate: 78,
    },
    {
      id: 2,
      title: "Corporate Partnership Program Applications",
      category: "corporate",
      priority: "medium",
      date: "2025-03-20",
      deadline: "2025-04-20",
      fundingAmount: "$50,000",
      content:
        "Applications are now open for our Corporate Partnership Program. This initiative connects industry leaders with our technical community to foster innovation and create real-world solutions to business challenges.",
      eligibility: ["Established Companies", "Startups with Series A+", "Industry Consortiums"],
      applicationLink: "#",
      isNew: true,
      contactPerson: "Michael Rodriguez",
      contactAvatar: "/placeholder.svg?height=40&width=40",
      benefits: ["Access to talent pool", "Co-branded events", "Research collaboration"],
      completionRate: 45,
    },
    {
      id: 3,
      title: "Platform API Maintenance Notice",
      category: "maintenance",
      priority: "low",
      date: "2025-03-25",
      time: "2:00 AM - 4:00 AM EST",
      content:
        "Scheduled maintenance will occur on our API infrastructure. During this time, all API endpoints will be unavailable. Please adjust your development workflows accordingly and check our status page for real-time updates.",
      affectedServices: ["REST API v2", "GraphQL Endpoint", "Webhook Delivery"],
      status: "Scheduled",
      isNew: false,
      techDetails: "We're upgrading our database clusters and implementing new security protocols.",
      alternativeSolutions: "Use our backup endpoints at api-backup.example.com during the maintenance window.",
      completionRate: 100,
    },
    {
      id: 4,
      title: "New Code of Conduct for Technical Forums",
      category: "policy",
      priority: "high",
      date: "2025-03-10",
      content:
        "We've updated our Code of Conduct for all technical forums and community spaces. These changes emphasize inclusive language, respectful technical discussions, and proper attribution of code examples and solutions.",
      documentLink: "#",
      isNew: false,
      keyChanges: [
        "Expanded definition of harassment",
        "New process for reporting violations",
        "Guidelines for sharing code",
      ],
      reviewDeadline: "2025-03-31",
      completionRate: 65,
    },
    {
      id: 5,
      title: "Quarterly Technical Roadmap Update",
      category: "updates",
      priority: "medium",
      date: "2025-03-05",
      content:
        "Our Q1 2025 technical roadmap has been published. Key highlights include new learning paths for cloud technologies, expanded corporate mentorship opportunities, and the launch of our technical certification program.",
      reportLink: "#",
      isNew: false,
      keyMilestones: [
        "Cloud certification program launch",
        "Corporate mentorship platform",
        "Technical content library expansion",
      ],
      stakeholders: ["Education Team", "Corporate Partners", "Community Leaders"],
      completionRate: 90,
    },
    {
      id: 6,
      title: "Hackathon: Sustainable Tech Solutions",
      category: "events",
      priority: "high",
      date: "2025-04-10",
      time: "48-hour event",
      location: "Hybrid (In-person & Virtual)",
      content:
        "Join our biggest hackathon of the year focused on developing sustainable technology solutions. Teams will compete to create innovative approaches to environmental challenges using cutting-edge technologies.",
      registrationLink: "#",
      isNew: true,
      prizes: ["$10,000 Grand Prize", "Corporate Mentorship", "Incubator Access"],
      techFocus: ["Clean Energy", "Sustainable Computing", "Environmental Monitoring"],
      sponsors: ["TechCorp", "GreenFuture", "InnovateSustain"],
      completionRate: 30,
    },
  ]

  const upcomingDeadlines = [
    { title: "Corporate Partnership Applications", date: "2025-04-20", progress: 45 },
    { title: "Technical Certification Registration", date: "2025-05-01", progress: 60 },
    { title: "Research Paper Submissions", date: "2025-05-15", progress: 25 },
    { title: "Mentor Program Applications", date: "2025-06-30", progress: 10 },
  ]

  const categories = [
    { id: "technical", label: "Technical", icon: <Code className="w-4 h-4" />, color: "bg-blue-500" },
    { id: "corporate", label: "Corporate", icon: <BarChart className="w-4 h-4" />, color: "bg-red-500" },
    { id: "events", label: "Events", icon: <Calendar className="w-4 h-4" />, color: "bg-green-500" },
    { id: "maintenance", label: "Maintenance", icon: <Settings className="w-4 h-4" />, color: "bg-yellow-500" },
    { id: "policy", label: "Policy", icon: <FileText className="w-4 h-4" />, color: "bg-purple-500" },
    { id: "updates", label: "Updates", icon: <Zap className="w-4 h-4" />, color: "bg-indigo-500" },
  ]

  const toggleSaveNotice = (id) => {
    setSavedNotices((prev) => (prev.includes(id) ? prev.filter((noticeId) => noticeId !== id) : [...prev, id]))
  }

  const toggleExpandNotice = (id) => {
    setExpandedNotice(expandedNotice === id ? null : id)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      case "medium":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
      case "low":
        return "bg-black bg-opacity-5 text-black border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-gray-700"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  const getCategoryInfo = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId) || {
      id: categoryId,
      label: categoryId,
      icon: <Tag className="w-4 h-4" />,
      color: "bg-gray-500",
    }
    return category
  }

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || notice.category === selectedCategory
    const matchesPriority = selectedPriority === "all" || notice.priority === selectedPriority
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "saved" && savedNotices.includes(notice.id)) ||
      (activeTab === "new" && notice.isNew)
    return matchesSearch && matchesCategory && matchesPriority && matchesTab
  })

  // Custom Button Component
  const Button = ({
    children,
    variant = "default",
    size = "default",
    className = "",
    onClick,
    ...props
  }) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"

    const variantStyles = {
      default: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
      outline:
        "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300",
      ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300",
      link: "bg-transparent underline-offset-4 hover:underline text-red-600 dark:text-red-400 p-0 h-auto",
      secondary: "bg-white text-red-600 hover:bg-gray-100",
    }

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-10 w-10 p-0",
    }

    return (
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    )
  }

  // Custom Badge Component
  const Badge = ({
    children,
    className = "",
  }) => {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
        {children}
      </span>
    )
  }

  // Custom Card Components
  const Card = ({
    children,
    className = "",
  }) => {
    return (
      <div className={`rounded-lg border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 ${className}`}>
        {children}
      </div>
    )
  }

  const CardHeader = ({
    children,
    className = "",
  }) => {
    return <div className={`p-6 ${className}`}>{children}</div>
  }

  const CardContent = ({
    children,
    className = "",
  }) => {
    return <div className={`p-6 pt-0 ${className}`}>{children}</div>
  }

  const CardFooter = ({
    children,
    className = "",
  }) => {
    return <div className={`p-6 pt-0 flex items-center ${className}`}>{children}</div>
  }

  // Custom Tabs Components
  const Tabs = ({
    children,
    defaultValue,
    className = "",
    onValueChange: onValueChangeProp,
  }) => {
    const onValueChange = (value) => {
      setActiveTab(value)
      onValueChangeProp(value)
    }

    return <div className={`${className}`}>{children}</div>
  }

  const TabsList = ({
    children,
    className = "",
  }) => {
    return (
      <div
        className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 dark:bg-gray-800 ${className}`}
      >
        {children}
      </div>
    )
  }

  const TabsTrigger = ({
    children,
    value,
    className = "",
  }) => {
    const isActive = activeTab === value

    return (
      <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          isActive
            ? "bg-red-600 text-white dark:bg-red-700"
            : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        } ${className}`}
        onClick={() => setActiveTab(value)}
      >
        {children}
      </button>
    )
  }

  // Custom Input Component
  const Input = ({
    className = "",
    ...props
  }) => {
    return (
      <input
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-red-700 ${className}`}
        {...props}
      />
    )
  }

  // Custom Select Components
  const Select = ({
    children,
    value,
    onValueChange,
  }) => {
    return <div className="relative">{children}</div>
  }

  const SelectTrigger = ({
    children,
    className = "",
    onClick,
  }) => {
    return (
      <button
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${className}`}
        onClick={onClick}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }

  const SelectContent = ({
    children,
    className = "",
    isOpen,
  }) => {
    if (!isOpen) return null

    return (
      <div
        className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-700 shadow-md animate-in fade-in-80 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 w-full mt-1 ${className}`}
      >
        <div className="p-1">{children}</div>
      </div>
    )
  }

  const SelectItem = ({
    children,
    value,
    className = "",
    onClick,
  }) => {
    return (
      <div
        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }

  const SelectValue = ({
    placeholder,
  }) => {
    const getDisplayValue = () => {
      if (placeholder === "Select category" && selectedCategory !== "all") {
        const category = getCategoryInfo(selectedCategory)
        return category.label
      }

      if (placeholder === "Select priority" && selectedPriority !== "all") {
        return selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)
      }

      return placeholder
    }

    return <span>{getDisplayValue()}</span>
  }

  // Custom Tooltip Components
  const TooltipProvider = ({
    children,
  }) => {
    return <>{children}</>
  }

  const Tooltip = ({
    children,
  }) => {
    return <>{children}</>
  }

  const TooltipTrigger = ({
    children,
    asChild = false,
  }) => {
    return <>{children}</>
  }

  const TooltipContent = ({
    children,
  }) => {
    return (
      <div className="z-50 overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-md animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {children}
      </div>
    )
  }

  // Custom Avatar Components
  const Avatar = ({
    children,
    className = "",
  }) => {
    return (
      <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
    )
  }

  const AvatarImage = ({
    src,
    alt = "",
  }
   ) => {
    return <img src={src || "/placeholder.svg"} alt={alt} className="h-full w-full object-cover" />
  }

  const AvatarFallback = ({
    children,
  }) => {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        {children}
      </div>
    )
  }

  // Custom Switch Component
  const Switch = ({
    checked,
    onCheckedChange,
    className = "",
  }) => {
    return (
      <button
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
          checked ? "bg-gray-800" : "bg-gray-300 dark:bg-gray-600"
        } ${className}`}
        onClick={() => onCheckedChange(!checked)}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    )
  }

  // Custom Progress Component
  const Progress = ({
    value = 0,
    className = "",
  }) => {
    return (
      <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}>
        <div className="h-full bg-red-600 dark:bg-red-700 transition-all" style={{ width: `${value}%` }} />
      </div>
    )
  }

  // Render compact view of a notice
  const renderCompactNotice = (notice) => (
    <div
      key={notice.id}
      className={`p-4 border-l-4 ${
        notice.priority === "high"
          ? "border-l-red-600"
          : notice.priority === "medium"
            ? "border-l-gray-600"
            : "border-l-black"
      } bg-white dark:bg-gray-900 rounded-md shadow-sm hover:shadow-md transition-all duration-200 mb-2`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryInfo(notice.category).color}`}
          >
            {getCategoryInfo(notice.category).icon}
          </div>
          <h3 className="font-medium">{notice.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {notice.isNew && <Badge className="bg-red-600 text-white dark:bg-red-700">New</Badge>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleSaveNotice(notice.id)}
            className={
              savedNotices.includes(notice.id)
                ? "text-red-600 dark:text-red-400"
                : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          >
            <Bookmark className="w-4 h-4" fill={savedNotices.includes(notice.id) ? "currentColor" : "none"} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toggleExpandNotice(notice.id)}>
            {expandedNotice === notice.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {expandedNotice === notice.id && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{notice.content}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{notice.date}</span>
            </div>
            {notice.time && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>{notice.time}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            {notice.registrationLink && (
              <Button size="sm" className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                Register
              </Button>
            )}
            {notice.applicationLink && (
              <Button size="sm" className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                Apply
              </Button>
            )}
            {notice.documentLink && (
              <Button size="sm" className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                View Document
              </Button>
            )}
            {notice.reportLink && (
              <Button size="sm" className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                View Report
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Render card view of a notice
  const renderCardNotice = (notice) => (
    <Card
      key={notice.id}
      className={`overflow-hidden transition-all duration-200 ${
        expandedNotice === notice.id
          ? "border-red-600 dark:border-red-700 shadow-md"
          : "hover:border-gray-400 dark:hover:border-gray-600"
      } dark:bg-gray-900 dark:border-gray-800`}
    >
      <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between bg-gray-50 dark:bg-gray-800/50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {notice.isNew && <Badge className="bg-red-600 text-white dark:bg-red-700">New</Badge>}
            <Badge className={`${getPriorityColor(notice.priority)} border`}>
              {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
            </Badge>
            <Badge className={`${getCategoryInfo(notice.category).color} text-white`}>
              {getCategoryInfo(notice.category).label}
            </Badge>
          </div>
          <h2 className="text-xl font-bold dark:text-white">{notice.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSaveNotice(notice.id)}
                  className={
                    savedNotices.includes(notice.id)
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }
                >
                  <Bookmark className="w-5 h-5" fill={savedNotices.includes(notice.id) ? "currentColor" : "none"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{savedNotices.includes(notice.id) ? "Remove from saved" : "Save notice"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4 dark:text-gray-300">
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-500" />
            <span>{notice.date}</span>
          </div>
          {notice.time && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-500" />
              <span>{notice.time}</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Completion</span>
            <span className="text-xs font-medium">{notice.completionRate}%</span>
          </div>
          <Progress value={notice.completionRate} className="h-1" />
        </div>

        <p className={`text-gray-700 dark:text-gray-300 ${expandedNotice === notice.id ? "" : "line-clamp-2"}`}>
          {notice.content}
        </p>

        {expandedNotice === notice.id && (
          <div className="mt-6 space-y-6">
            {/* Contact/Instructor Information */}
            {(notice.instructor || notice.contactPerson) && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Avatar>
                  <AvatarImage src={notice.instructorAvatar || notice.contactAvatar} />
                  <AvatarFallback>{(notice.instructor || notice.contactPerson)?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{notice.instructor || notice.contactPerson}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {notice.instructor ? "Instructor" : "Contact Person"}
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details */}
            {(notice.techStack || notice.prerequisites || notice.techDetails) && (
              <div className="space-y-3">
                <h4 className="font-medium text-lg">Technical Details</h4>

                {notice.techStack && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Tech Stack:</div>
                    <div className="flex flex-wrap gap-2">
                      {notice.techStack.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {notice.prerequisites && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Prerequisites:</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {notice.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {notice.techDetails && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Additional Information:</div>
                    <p className="text-sm">{notice.techDetails}</p>
                  </div>
                )}

                {notice.alternativeSolutions && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Alternative Solutions:</div>
                    <p className="text-sm">{notice.alternativeSolutions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Corporate/Event Details */}
            {(notice.benefits || notice.eligibility || notice.prizes || notice.sponsors) && (
              <div className="space-y-3">
                <h4 className="font-medium text-lg">Program Details</h4>

                {notice.benefits && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Benefits:</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {notice.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {notice.eligibility && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Eligibility:</div>
                    <div className="flex flex-wrap gap-2">
                      {notice.eligibility.map((item, index) => (
                        <Badge
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {notice.prizes && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Prizes:</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {notice.prizes.map((prize, index) => (
                        <li key={index}>{prize}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {notice.sponsors && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Sponsors:</div>
                    <div className="flex flex-wrap gap-2">
                      {notice.sponsors.map((sponsor, index) => (
                        <Badge key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                          {sponsor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Policy/Update Details */}
            {(notice.keyChanges || notice.keyMilestones || notice.stakeholders) && (
              <div className="space-y-3">
                <h4 className="font-medium text-lg">Key Information</h4>

                {notice.keyChanges && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Key Changes:</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {notice.keyChanges.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {notice.keyMilestones && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Key Milestones:</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {notice.keyMilestones.map((milestone, index) => (
                        <li key={index}>{milestone}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {notice.stakeholders && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Stakeholders:</div>
                    <div className="flex flex-wrap gap-2">
                      {notice.stakeholders.map((stakeholder, index) => (
                        <Badge
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                          {stakeholder}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {notice.reviewDeadline && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Review Deadline:</div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{notice.reviewDeadline}</p>
                  </div>
                )}
              </div>
            )}

            {/* Attachments */}
            {notice.attachments && notice.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-lg">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {notice.attachments.map((attachment, index) => (
                    <Button key={index} variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      {attachment}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {notice.registrationLink && (
                <Button className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                  Register Now
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              )}

              {notice.applicationLink && (
                <Button className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                  Apply Now
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              )}

              {notice.documentLink && (
                <Button className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                  View Document
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              )}

              {notice.reportLink && (
                <Button className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                  View Report
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleExpandNotice(notice.id)}
          className="text-gray-700 dark:text-gray-300"
        >
          {expandedNotice === notice.id ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show More
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark" : ""} bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200`}
    >
      {/* Header Section */}
      <div className="bg-red-600 dark:bg-red-900 text-white py-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold flex items-center">
                <Bell className="mr-2 h-6 w-6" />
                Community Notices
              </h1>
              <p className="text-red-100 mt-1">Technical updates and corporate announcements</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Dark Mode</span>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                  className={
                    viewMode === "card"
                      ? "bg-white !text-red-600 hover:bg-gray-100"
                      : "text-white border-white hover:bg-white"
                  }
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === "compact" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("compact")}
                  className={
                    viewMode === "compact"
                      ? "bg-white text-red-600 hover:bg-gray-100"
                      : "text-white border-white hover:bg-red-700"
                  }
                >
                  <List className="w-4 h-4 mr-1" />
                  Compact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search Section */}
      <div className="bg-white dark:bg-gray-900 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white dark:data-[state=active]:bg-red-700"
                >
                  All Notices
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white dark:data-[state=active]:bg-red-700"
                >
                  New
                  <Badge className="ml-2 bg-red-600 text-white dark:bg-red-700">
                    {notices.filter((n) => n.isNew).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white dark:data-[state=active]:bg-red-700"
                >
                  Saved
                  <Badge className="ml-2 bg-gray-700 text-white">{savedNotices.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notices..."
                className="pl-10 border-gray-300 focus:border-red-600 focus:ring-red-600 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-red-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 dark:border-gray-700 dark:text-gray-300"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              Filters
              {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          {/* Filter Options */}
          {isFilterOpen && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger
                    className="w-full dark:border-gray-700 dark:bg-gray-800"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700" isOpen={categoryDropdownOpen}>
                    <SelectItem
                      value="all"
                      onClick={() => {
                        setSelectedCategory("all")
                        setCategoryDropdownOpen(false)
                      }}
                    >
                      All Categories
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setCategoryDropdownOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          <span className="capitalize">{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger
                    className="w-full dark:border-gray-700 dark:bg-gray-800"
                    onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700" isOpen={priorityDropdownOpen}>
                    <SelectItem
                      value="all"
                      onClick={() => {
                        setSelectedPriority("all")
                        setPriorityDropdownOpen(false)
                      }}
                    >
                      All Priorities
                    </SelectItem>
                    <SelectItem
                      value="high"
                      onClick={() => {
                        setSelectedPriority("high")
                        setPriorityDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500"></span>
                        <span>High</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="medium"
                      onClick={() => {
                        setSelectedPriority("medium")
                        setPriorityDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400"></span>
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="low"
                      onClick={() => {
                        setSelectedPriority("low")
                        setPriorityDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
                        <span>Low</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notices List */}
            <div className="lg:col-span-2 space-y-6">
              {filteredNotices.length > 0 ? (
                filteredNotices.map((notice) =>
                  viewMode === "card" ? renderCardNotice(notice) : renderCompactNotice(notice),
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <Info className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No notices found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedPriority("all")
                      setActiveTab("all")
                    }}
                    className="dark:border-gray-700 dark:text-gray-300"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold dark:text-white">Notice Overview</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Notices</span>
                      <span className="font-bold dark:text-white">{notices.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Technical</span>
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        {notices.filter((n) => n.category === "technical").length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Corporate</span>
                      <Badge className="bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                        {notices.filter((n) => n.category === "corporate").length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">High Priority</span>
                      <Badge className="bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                        {notices.filter((n) => n.priority === "high").length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold dark:text-white">Upcoming Deadlines</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {upcomingDeadlines.map((deadline, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{deadline.title}</span>
                          <span className="font-medium text-red-600 dark:text-red-400">{deadline.date}</span>
                        </div>
                        <div className="w-full">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{deadline.progress}%</span>
                          </div>
                          <Progress value={deadline.progress} className="h-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-center">
                  <Button variant="link" className="text-red-600 dark:text-red-400">
                    View All Deadlines
                    <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Category Legend */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold dark:text-white">Categories</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedCategory(selectedCategory === category.id ? "all" : category.id)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center text-white`}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <span className="capitalize font-medium dark:text-white">{category.label}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {notices.filter((n) => n.category === category.id).length} notices
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white border-none">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Join Our Community</h3>
                      <p className="text-sm text-red-100 mb-3">
                        Connect with other technical professionals and corporate partners in our growing community.
                      </p>
                      <Button variant="secondary" className="w-full bg-white text-red-600 hover:bg-red-50">
                        Join Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default index
