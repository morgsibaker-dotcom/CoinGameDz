import Header from '../components/common/Header'
import BottomNavigation from '../components/common/BottomNavigation'
import AdCard from '../components/earn/AdCard'
import TaskCard from '../components/earn/TaskCard'
import Card from '../components/common/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/common/Tabs'
import { useState } from 'react'
import { Task } from '../types'
import { addPoints } from '../services/pointsService'
import { useTelegramStore } from '../store/telegramStore'
import { useUserStore } from '../store/userStore'

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
  const [activeTab, setActiveTab] = useState('ads')
  const [tasks, setTasks] = useState(mockTasks)

  const { telegramUser } = useTelegramStore()
  const { updatePoints } = useUserStore()

  const handleCompleteTask = async (task: Task) => {
    if (!telegramUser) {
      return
    }

    try {
      const newBalance = await addPoints(
        telegramUser.id,
        task.reward,
        'task',
        task.title
      )

      updatePoints(Number(newBalance))

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id
            ? { ...item, completed: true }
            : item
        )
      )
    } catch (error) {
      console.error('[CoinGameDz] Failed to complete task', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      <Header />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Earn Points
            </h2>
            <p className="text-slate-400 text-sm">
              Complete tasks and watch ads to earn points
            </p>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ads">
              Ads ({mockAds.length})
            </TabsTrigger>

            <TabsTrigger value="tasks">
              Tasks ({tasks.length})
            </TabsTrigger>
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
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => handleCompleteTask(task)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  )
}
