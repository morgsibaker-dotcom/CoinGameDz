import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import AdCard from '../components/earn/AdCard'
import TaskCard from '../components/earn/TaskCard'
import Card from '../components/common/Card'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/common/Tabs'
import { useState } from 'react'
import { Task } from '../types'

const mockAds = [
  {
    title: 'Game Install',
    description: 'Download and install the new game',
    reward: 500,
    watched: false,
  },
  {
    title: 'App Survey',
    description: 'Complete a short survey about apps',
    reward: 300,
    watched: true,
  },
  {
    title: 'Video Ads',
    description: 'Watch advertisement videos',
    reward: 100,
    watched: false,
  },
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Daily Login',
    description: 'Login to the app every day',
    reward: 50,
    icon: 'calendar',
    completed: true,
    category: 'click',
  },
  {
    id: '2',
    title: 'Invite Friends',
    description: 'Invite 3 friends to join',
    reward: 200,
    icon: 'users',
    completed: false,
    category: 'click',
  },
  {
    id: '3',
    title: 'Complete Profile',
    description: 'Fill all your profile information',
    reward: 150,
    icon: 'user',
    completed: false,
    category: 'click',
  },
]

export default function Earn() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('ads')

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Earn Points</h2>
            <p className="text-slate-400 text-sm">
              Complete tasks and watch ads to earn points
            </p>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ads">Ads ({mockAds.length})</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({mockTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-3 mt-4">
            {mockAds.map((ad, idx) => (
              <AdCard
                key={idx}
                title={ad.title}
                description={ad.description}
                reward={ad.reward}
                watched={ad.watched}
              />
            ))}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-3 mt-4">
            {mockTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  )
}
