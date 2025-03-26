
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Meetup {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  points: number;
  createdBy: string;
}

// Mock data for meetups
export const meetups: Meetup[] = [
  {
    id: "1",
    title: "Hey guys I am looking to play chess @2pm...",
    description: "Looking for chess partners at the Student Union. All skill levels welcome!",
    dateTime: "Today @2pm",
    location: "Student Union",
    points: 3,
    createdBy: "ChessMaster101"
  },
  {
    id: "2",
    title: "Pickleball partner needed Monday @5pm...",
    description: "Need a partner for pickleball on Monday afternoon. Intermediate level preferred.",
    dateTime: "Monday @5pm",
    location: "Recreation Center East Courts",
    points: 3,
    createdBy: "PickleballPro"
  },
  {
    id: "3",
    title: "Looking for a reading buddy in the library Tue...",
    description: "Let's read together at the library and discuss books. Bringing coffee and snacks!",
    dateTime: "Tuesday @3pm",
    location: "McDermott Library 3rd Floor",
    points: 3,
    createdBy: "BookwormUTD"
  },
  {
    id: "4",
    title: "Swimming group on Fridays pull up!",
    description: "Weekly swimming session for exercise and fun. All levels welcome.",
    dateTime: "Friday @6pm",
    location: "Activity Center Pool",
    points: 3,
    createdBy: "SwimTeamCaptain"
  },
  {
    id: "5",
    title: "Looking for biology study sessions",
    description: "Group study for BIOL 2311. Bring your notes and questions.",
    dateTime: "Wednesday @4pm",
    location: "Science Building Room 2.410",
    points: 3,
    createdBy: "BiologyMajor22"
  },
  {
    id: "6",
    title: "Sand Volleyball @ 7pm",
    description: "Casual sand volleyball game. Teams will be formed on site.",
    dateTime: "Thursday @7pm",
    location: "Phase 8 Sand Courts",
    points: 6,
    createdBy: "VolleyballFan"
  },
  {
    id: "7",
    title: "Ping-pong tournament Fri",
    description: "Student-organized ping-pong tournament with prizes for winners!",
    dateTime: "Friday @5pm",
    location: "Residence Hall West Common Area",
    points: 8,
    createdBy: "PingPongChamp"
  },
  {
    id: "8",
    title: "Valorant Comet LANding 3pm",
    description: "LAN party for Valorant players. Bring your own laptop.",
    dateTime: "Saturday @3pm",
    location: "ECSW 1.355",
    points: 1,
    createdBy: "GamingComet"
  },
  {
    id: "9",
    title: "Calc 1 study buddy rn @ library",
    description: "Need help with Calculus 1? Join me at the library for a study session.",
    dateTime: "Today @7pm",
    location: "McDermott Library 2nd Floor",
    points: 3,
    createdBy: "MathWhiz"
  }
];

// Get all meetups
export const getMeetups = () => {
  return meetups;
};

// User store for points and level
interface UserState {
  points: number;
  level: number;
  attendedMeetups: string[];
  addPoints: (points: number) => void;
  attendMeetup: (meetupId: string, points: number) => void;
  getLevel: () => number;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      points: 0,
      level: 1,
      attendedMeetups: [],
      addPoints: (points: number) => 
        set(state => ({ 
          points: state.points + points,
          level: Math.floor(state.points / 10) + 1
        })),
      attendMeetup: (meetupId: string, points: number) => 
        set(state => {
          if (state.attendedMeetups.includes(meetupId)) {
            return state; // Already attended
          }
          const newPoints = state.points + points;
          const newLevel = Math.floor(newPoints / 10) + 1;
          return {
            points: newPoints,
            level: newLevel,
            attendedMeetups: [...state.attendedMeetups, meetupId]
          };
        }),
      getLevel: () => {
        const state = get();
        return Math.floor(state.points / 10) + 1;
      }
    }),
    {
      name: 'user-points-storage'
    }
  )
);
