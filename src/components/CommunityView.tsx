import React, { useState, useEffect, useRef } from 'react';
import { DetectiveProfile, TabType } from '../types';
import { 
  Sparkles, 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Camera, 
  Send, 
  Plus, 
  Users, 
  UserCheck, 
  UserPlus,
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  Share2,
  Trash2,
  Copy,
  Flag,
  Pin,
  Smile,
  Image as ImageIcon,
  Clock,
  Search as SearchIcon,
  FileText,
  GraduationCap
} from 'lucide-react';
import { 
  playClickSound, 
  playCorrectSound, 
  playCoinSound, 
  playBadgeUnlockSound 
} from '../utils/sound';
import { dataService } from '../lib/dataService';
import { orderBy, limit } from 'firebase/firestore';
import { CommunityTeacherHub } from './community/CommunityTeacherHub';

interface CommunityViewProps {
  profile: DetectiveProfile;
  onUpdateProfile: (updated: Partial<DetectiveProfile>) => void;
  onNavigateTab: (tab: TabType) => void;
  onShowToast: (title: string, message: string, type?: 'exp' | 'badge') => void;
  initialSubTab?: 'feed' | 'teacher_hub' | 'homework' | 'teacher_chat' | 'friends' | 'groups' | 'announcements';
}

interface PostItem {
  id: string;
  author: string;
  avatar: string;
  customAvatarImage?: string;
  levelText?: string;
  badgeTag?: string;
  timeAgo: string;
  timestamp: number;
  content: string;
  highlightCard?: {
    title: string;
    subtitle: string;
    stars: number;
  };
  imageBanner?: string;
  likes: number;
  likedByUser?: boolean;
  commentsCount: number;
  comments: { id: string; user: string; avatar?: string; text: string; time: string }[];
  isMyPost?: boolean;
}

interface FriendItem {
  id: string;
  name: string;
  avatar: string;
  level: number;
  badge: string;
  isOnline: boolean;
  statusText: string;
  isFriend: boolean;
}

interface GroupClub {
  id: string;
  name: string;
  desc: string;
  membersCount: number;
  icon: string;
  tag: string;
  isJoined: boolean;
}

interface AnnouncementItem {
  id: string;
  author: string;
  avatar: string;
  badgeTag: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
  tag: string;
}

const DEFAULT_POSTS: PostItem[] = [
  {
    id: 'post_1',
    author: 'น้องปันดาว',
    avatar: '👦',
    levelText: 'Level 6',
    timeAgo: '2 ชั่วโมงที่แล้ว',
    timestamp: Date.now() - 2 * 3600 * 1000,
    content: 'เพิ่งผ่านด่าน 4 มาได้! 🎉 สนุกมากเลยครับ',
    highlightCard: {
      title: 'ด่านที่ 4',
      subtitle: 'ประเมินความน่าเชื่อถือของข้อมูล',
      stars: 3,
    },
    likes: 23,
    likedByUser: false,
    commentsCount: 5,
    comments: [
      { id: 'c1', user: 'น้องมินนี่', avatar: '👧', text: 'ยินดีด้วยนะ! เก่งมากๆ เลย', time: '1 ชั่วโมงที่แล้ว' },
      { id: 'c2', user: 'สารวัตรไบต์', avatar: '🤖', text: 'ยอดเยี่ยมมากนักสืบปันดาว! หมั่นทบทวนคาถาตรวจสอบเสมอ', time: '1 ชั่วโมงที่แล้ว' }
    ]
  },
  {
    id: 'post_2',
    author: 'คุณครูแสนดี',
    avatar: '👩‍🏫',
    badgeTag: 'ครู',
    timeAgo: '5 ชั่วโมงที่แล้ว',
    timestamp: Date.now() - 5 * 3600 * 1000,
    content: 'ยินดีกับทุกคนที่ทำภารกิจประจำวันสำเร็จนะครับ! 🎉',
    imageBanner: '/images/cute_robot_mascot_1788247457628.jpg',
    likes: 35,
    likedByUser: true,
    commentsCount: 12,
    comments: [
      { id: 'c3', user: 'น้องไอซ์ซี่', avatar: '👧', text: 'ขอบคุณครับคุณครู หนูได้แต้ม EXP เพิ่มเยอะเลย', time: '4 ชั่วโมงที่แล้ว' },
      { id: 'c4', user: 'น้องวิน', avatar: '👦', text: 'วันนี้เคลียร์เคสครบ 3 คดีแล้วครับครู!', time: '3 ชั่วโมงที่แล้ว' }
    ]
  },
  {
    id: 'post_3',
    author: 'น้องไอซ์ซี่',
    avatar: '👧',
    levelText: 'Level 5',
    timeAgo: '1 วันที่แล้ว',
    timestamp: Date.now() - 24 * 3600 * 1000,
    content: 'มีใครพอแนะนำเทคนิคการค้นหาข้อมูลขั้นสูงบ้างคะ? 🙏',
    likes: 15,
    likedByUser: false,
    commentsCount: 8,
    comments: [
      { id: 'c5', user: 'คุณครูแสนดี', avatar: '👩‍🏫', text: 'ลองใช้เครื่องหมายคำพูด "" ครอบคำสำคัญ และใช้ site: ดูนะจ๊ะ', time: '20 ชั่วโมงที่แล้ว' },
      { id: 'c6', user: 'น้องปันดาว', avatar: '👦', text: 'ดูในบันทึกของฉัน ตรงหมวดคำค้นหาช่วยได้เยอะเลยครับ', time: '18 ชั่วโมงที่แล้ว' }
    ]
  }
];

const DEFAULT_FRIENDS: FriendItem[] = [
  {
    id: 'f1',
    name: 'น้องปันดาว',
    avatar: '👦',
    level: 6,
    badge: 'เซียนโอเปอเรเตอร์',
    isOnline: true,
    statusText: 'กำลังลุยด่าน 5 ห้องปฏิบัติการ',
    isFriend: true
  },
  {
    id: 'f2',
    name: 'น้องไอซ์ซี่',
    avatar: '👧',
    level: 5,
    badge: 'นักสืบตรรกะ',
    isOnline: true,
    statusText: 'อ่านสรุปในบันทึกของฉัน',
    isFriend: true
  },
  {
    id: 'f3',
    name: 'น้องวิน',
    avatar: '🧑',
    level: 4,
    badge: 'นักสืบฝึกหัด',
    isOnline: false,
    statusText: 'ออฟไลน์เมื่อ 2 ชม. ที่แล้ว',
    isFriend: true
  },
  {
    id: 'f4',
    name: 'น้องพลอย',
    avatar: '👱‍♀️',
    level: 7,
    badge: 'ยอดนักสืบไซเบอร์',
    isOnline: true,
    statusText: 'กำลังทำแบบทดสอบวัดผล',
    isFriend: false
  },
  {
    id: 'f5',
    name: 'น้องเติ้ล',
    avatar: '🧒',
    level: 5,
    badge: 'ผู้พิทักษ์คีย์เวิร์ด',
    isOnline: false,
    statusText: 'ออฟไลน์เมื่อวาน',
    isFriend: false
  }
];

const DEFAULT_GROUPS: GroupClub[] = [
  {
    id: 'g1',
    name: 'ชมรมยอดนักสืบดิจิทัล ป.5',
    desc: 'พื้นที่แลกเปลี่ยนแนวทางผ่านด่าน ปรึกษาโจทย์ และเทคนิคการค้นหาความจริง',
    membersCount: 54,
    icon: '🔍',
    tag: 'ยอดนิยม',
    isJoined: true
  },
  {
    id: 'g2',
    name: 'แก๊งเซียนโอเปอเรเตอร์ & คาถาค้นหา',
    desc: 'เจาะลึกเทคนิคการใช้ "" (เครื่องหมายคำพูด), site:, filetype: และลบคำที่ไม่ต้องการ',
    membersCount: 42,
    icon: '⚡',
    tag: 'แนะนำ',
    isJoined: false
  },
  {
    id: 'g3',
    name: 'กลุ่มพิทักษ์ข้อมูลส่วนตัว & Cyber Safety',
    desc: 'ร่วมเรียนรู้วิธีป้องกันภัยไซเบอร์ ไม่หลงกลข่าวปลอม และปกป้องรหัสผ่าน',
    membersCount: 38,
    icon: '🛡️',
    tag: 'ปลอดภัย',
    isJoined: true
  },
  {
    id: 'g4',
    name: 'ห้องติวเข้มสอบประเมิน ป.5',
    desc: 'ทบทวน 5 ขั้นตอนสืบค้นข้อมูล เตรียมพร้อมรับเกียรติบัตรยอดนักสืบ',
    membersCount: 29,
    icon: '📚',
    tag: 'ทบทวน',
    isJoined: false
  }
];

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'a1',
    author: 'คุณครูแสนดี',
    avatar: '👩‍🏫',
    badgeTag: 'ครูผู้สอน',
    title: '🎉 ยินดีต้อนรับสู่ห้องเรียนสืบค้นข้อมูลออนไลน์ ป.5',
    content: 'นักเรียนทุกคนสามารถเข้าทำภารกิจในแต่ละด่านได้ตามจังหวะของตนเอง หากมีข้อสงสัยสามารถโพสต์ถามเพื่อนๆ ในชุมชน หรือพิมพ์ถามสารวัตรไบต์ในแชทได้ตลอดเวลานะครับ!',
    date: 'วันนี้ 08:30 น.',
    isPinned: true,
    tag: 'ข่าวสารห้องเรียน'
  },
  {
    id: 'a2',
    author: 'สารวัตรไบต์',
    avatar: '🤖',
    badgeTag: 'ผู้ดูแลระบบ',
    title: '🛡️ ข้อพึงระวังในการใช้งานชุมชนออนไลน์สำหรับนักสืบ',
    content: '1. ห้ามเปิดเผยข้อมูลส่วนบุคคล (ชื่อจริง-นามสกุล, เบอร์โทร, รหัสผ่าน)\n2. ใช้ถ้อยคำสุภาพ ให้เกียรติเพื่อนร่วมชั้น\n3. ไม่นำผลงานของผู้อื่นมาแอบอ้างเป็นของตนเอง',
    date: 'เมื่อวานนี้',
    isPinned: true,
    tag: 'กฎกติกามารยาท'
  },
  {
    id: 'a3',
    author: 'ศูนย์บัญชาการนักสืบ',
    avatar: '🏛️',
    badgeTag: 'ภารกิจพิเศษ',
    title: '🌟 กิจกรรมสุดสัปดาห์: ลุยด่านไขคดีรับ EXP x2!',
    content: 'วันเสาร์-อาทิตย์นี้ เมื่อทำคดีในด่านที่ 4 และด่านที่ 5 รับแต้มประสบการณ์และเหรียญ Detective Coin สองเท่าทันที!',
    date: '2 วันที่แล้ว',
    isPinned: false,
    tag: 'กิจกรรม'
  }
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateTab,
  onShowToast,
  initialSubTab
}) => {
  const [activeFilter, setActiveFilter] = useState<'feed' | 'teacher_hub' | 'friends' | 'groups' | 'announcements'>(() => {
    if (initialSubTab === 'homework' || initialSubTab === 'teacher_chat' || initialSubTab === 'teacher_hub') {
      return 'teacher_hub';
    }
    return initialSubTab || 'feed';
  });
  const [newPostText, setNewPostText] = useState('');
  const [selectedPostComments, setSelectedPostComments] = useState<PostItem | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [selectedHighlightLevel, setSelectedHighlightLevel] = useState<number | null>(null);
  const [openOptionsMenuPostId, setOpenOptionsMenuPostId] = useState<string | null>(null);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize posts from Firestore
  const [posts, setPosts] = useState<PostItem[]>([]);

  // Friends state
  const [friends, setFriends] = useState<FriendItem[]>([]);

  // Groups state
  const [groups, setGroups] = useState<GroupClub[]>([]);

  // Announcements state
  const [announcements] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);

  // Subscribe to real-time posts from Firestore
  useEffect(() => {
    const unsubscribe = dataService.subscribeCollection(
      'community_posts',
      [orderBy('timestamp', 'desc'), limit(50)],
      (data) => {
        if (data && data.length > 0) {
          const mappedPosts = data.map(p => ({
            ...p,
            timeAgo: new Date(p.timestamp?.seconds * 1000 || p.timestamp || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
          })) as PostItem[];
          setPosts(mappedPosts);
        } else if (data && data.length === 0) {
          // Explicitly empty Firestore: use default posts
          setPosts(DEFAULT_POSTS);
        } else {
          // If null or undefined (loading or error), keep previous or use defaults
          setPosts(prev => prev.length > 0 ? prev : DEFAULT_POSTS);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch initial friends and groups
  useEffect(() => {
    const loadData = async () => {
      const savedFriends = await dataService.getDoc('community_meta', 'friends');
      if (savedFriends) setFriends(savedFriends.items || DEFAULT_FRIENDS);
      else setFriends(DEFAULT_FRIENDS);

      const savedGroups = await dataService.getDoc('community_meta', 'groups');
      if (savedGroups) setGroups(savedGroups.items || DEFAULT_GROUPS);
      else setGroups(DEFAULT_GROUPS);
    };
    loadData();
  }, []);

  // Persist friends and groups (Simplified: update central meta doc)
  useEffect(() => {
    if (friends && friends.length > 0) {
      dataService.saveDoc('community_meta', 'friends', { items: friends });
    }
  }, [friends]);

  useEffect(() => {
    if (groups && groups.length > 0) {
      dataService.saveDoc('community_meta', 'groups', { items: groups });
    }
  }, [groups]);

  // Handle Like Toggle
  const handleToggleLike = (postId: string) => {
    playClickSound();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const nextLiked = !post.likedByUser;
    const nextLikes = nextLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1);

    dataService.saveDoc('community_posts', postId, {
      likedByUser: nextLiked,
      likes: nextLikes
    });
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playClickSound();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
          onShowToast('📷 แนบรูปภาพแล้ว', 'พร้อมสำหรับการโพสต์แบ่งปันเพื่อนๆ');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Create New Post
  const handleCreatePost = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPostText.trim() && !attachedImage && !selectedHighlightLevel) return;

    playCorrectSound();

    let highlightCard = undefined;
    if (selectedHighlightLevel) {
      const stageNames: Record<number, string> = {
        1: 'พื้นฐานการค้นหา & คำสำคัญ',
        2: 'เวทมนตร์โอเปอเรเตอร์',
        3: 'เกราะประเมินความน่าเชื่อถือ',
        4: 'สืบคดีปริศนาข่าวลือ',
        5: 'ห้องปฏิบัติการเสมือนจริง',
        6: 'แบบทดสอบยอดนักสืบ'
      };
      highlightCard = {
        title: `ด่านที่ ${selectedHighlightLevel}`,
        subtitle: stageNames[selectedHighlightLevel] || 'ภารกิจวิทยาการคำนวณ',
        stars: 3
      };
    }

    const newPostId = `post_${Date.now()}`;
    const newPost: any = {
      id: newPostId,
      author: profile.name || 'ฉัน',
      avatar: profile.avatar || '👧',
      customAvatarImage: profile.customAvatarImage,
      levelText: `Level ${profile.level || 5}`,
      timestamp: Date.now(),
      content: newPostText.trim() || (highlightCard ? `เพิ่งผ่าน${highlightCard.title}แล้วครับ/ค่ะ! 🎉` : 'แชร์ภาพกิจกรรมสู่ชุมชน 📸'),
      highlightCard,
      imageBanner: attachedImage || undefined,
      likes: 1,
      likedByUser: true,
      commentsCount: 0,
      comments: [],
      isMyPost: true,
      authorId: profile.authUser?.id || 'anonymous',
      timeAgo: 'เมื่อสักครู่'
    };

    // Optimistic update for instant feedback
    setPosts(prev => [newPost, ...prev.filter(p => !DEFAULT_POSTS.some(dp => dp.id === p.id))]);

    dataService.addDoc('community_posts', newPost);
    setNewPostText('');
    setAttachedImage(null);
    setSelectedHighlightLevel(null);
    onShowToast('🎉 โพสต์สำเร็จ!', 'แชร์เรื่องราวสู่ชุมชนนักสืบเรียบร้อยแล้ว', 'exp');
  };

  // Handle Delete Post
  const handleDeletePost = (postId: string) => {
    playClickSound();
    if (confirm('คุณต้องการลบโพสต์นี้ใช่หรือไม่?')) {
      dataService.deleteDoc('community_posts', postId);
      setOpenOptionsMenuPostId(null);
      onShowToast('ลบโพสต์แล้ว', 'นำโพสต์ออกจากฟีดกิจกรรมเรียบร้อย');
    }
  };

  // Handle Copy Post Content
  const handleCopyPost = (content: string) => {
    playClickSound();
    navigator.clipboard.writeText(content);
    setOpenOptionsMenuPostId(null);
    onShowToast('📋 คัดลอกสำเร็จ', 'คัดลอกข้อความโพสต์ลงคลิปบอร์ดแล้ว');
  };

  // Handle Share Post
  const handleSharePost = (post: PostItem) => {
    playClickSound();
    const shareText = `[ชุมชนยอดนักสืบดิจิทัล] ${post.author}: "${post.content}"`;
    navigator.clipboard.writeText(shareText);
    onShowToast('🔗 คัดลอกลิงก์แชร์แล้ว', 'นำไปส่งต่อให้เพื่อนๆ ในชั้นเรียนได้เลย!');
  };

  // Add Comment to Post
  const handleAddComment = () => {
    if (!selectedPostComments || !commentInput.trim()) return;
    playClickSound();
    const newComment = {
      id: `c_${Date.now()}`,
      user: profile.name || 'ฉัน',
      avatar: profile.avatar || '👧',
      text: commentInput.trim(),
      timestamp: Date.now()
    };

    const updatedComments = [...(selectedPostComments.comments || []), newComment];
    const newCount = (selectedPostComments.commentsCount || 0) + 1;

    dataService.saveDoc('community_posts', selectedPostComments.id, {
      commentsCount: newCount,
      comments: updatedComments
    });

    setSelectedPostComments(prev => prev ? {
      ...prev,
      commentsCount: newCount,
      comments: updatedComments
    } : null);

    setCommentInput('');
    onShowToast('💬 แสดงความคิดเห็นแล้ว', 'ส่งกำลังใจให้เพื่อนนักสืบเรียบร้อย');
  };

  // Toggle Friend state (Add / Remove)
  const handleToggleFriend = (friendId: string) => {
    playClickSound();
    setFriends(prev => prev.map(f => {
      if (f.id === friendId) {
        const nextState = !f.isFriend;
        if (nextState) {
          playCorrectSound();
          onShowToast('➕ เพิ่มเพื่อนแล้ว', `เพิ่ม ${f.name} เป็นเพื่อนสำเร็จ!`);
        } else {
          onShowToast('นำเพื่อนออก', `ยกเลิกการเป็นเพื่อนกับ ${f.name}`);
        }
        return { ...f, isFriend: nextState };
      }
      return f;
    }));
  };

  // Send Wave to Friend
  const handleSendWave = (friendName: string) => {
    playCorrectSound();
    onShowToast('👋 ส่งการทักทายแล้ว', `ส่งการโบกมือทักทายไปยัง ${friendName} แล้ว!`);
  };

  // Send Cheering Heart to Friend
  const handleSendHeart = (friendName: string) => {
    playCoinSound();
    onShowToast('❤️ ส่งพลังใจสำเร็จ!', `ส่งหัวใจและพลังบวกให้ ${friendName} เรียบร้อย (+5 EXP)`, 'exp');
  };

  // Toggle Group Join
  const handleToggleGroup = (groupId: string) => {
    playClickSound();
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const nextJoined = !g.isJoined;
        if (nextJoined) {
          playBadgeUnlockSound();
          onShowToast('🎉 เข้าร่วมกลุ่มแล้ว!', `คุณได้เป็นสมาชิกของ ${g.name}`);
        } else {
          onShowToast('ออกจากกลุ่ม', `ออกจาก ${g.name} แล้ว`);
        }
        return {
          ...g,
          isJoined: nextJoined,
          membersCount: nextJoined ? g.membersCount + 1 : Math.max(1, g.membersCount - 1)
        };
      }
      return g;
    }));
  };

  // Filtered friends
  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
    f.badge.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-50 font-sans text-slate-800 relative select-none">
      
      {/* Top Background Bunting & Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 left-10 w-96 h-40 bg-emerald-200 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-teal-200 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 space-y-4 relative z-10">
        
        {/* TOP FESTIVE GREEN BANNER: ✨ ชุมชน ✦ with Party Flags */}
        <div className="flex justify-center pt-1 pb-1">
          <div className="relative inline-flex items-center justify-center">
            {/* Ribbon Tails */}
            <div className="absolute -left-5 top-2 w-7 h-9 bg-emerald-800 -skew-y-12 rounded-l-md -z-10 shadow-md" />
            <div className="absolute -right-5 top-2 w-7 h-9 bg-emerald-800 skew-y-12 rounded-r-md -z-10 shadow-md" />
            
            {/* Ribbon Body */}
            <div className="px-12 sm:px-16 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 rounded-2xl text-white font-black text-xl sm:text-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-2 border-t border-emerald-300">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="tracking-wide drop-shadow-md">ชุมชน</span>
              <span className="text-amber-300 text-lg">✦</span>
            </div>

            {/* Party Flags on top */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-90">
              <span className="text-xs">🚩</span>
              <span className="text-xs">🎊</span>
              <span className="text-xs">🚩</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl border-4 border-white/90 p-4 sm:p-6 space-y-5">
          
          {/* FILTER PILLS (ฟีดกิจกรรม, ส่งงาน, คุยกับคุณครู, เพื่อน, กลุ่ม, ประกาศ) */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => { playClickSound(); setActiveFilter('feed'); }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all text-center shrink-0 sm:flex-1 ${
                activeFilter === 'feed'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ฟีดกิจกรรม
            </button>

            <button
              onClick={() => { playClickSound(); setActiveFilter('teacher_hub'); }}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all text-center shrink-0 sm:flex-1 flex items-center justify-center gap-1.5 ${
                activeFilter === 'teacher_hub'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span>ส่งงาน & คุยกับคุณครู</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFilter === 'teacher_hub' ? 'bg-amber-300 text-slate-950' : 'bg-amber-100 text-amber-800'
              }`}>
                4 งาน
              </span>
            </button>

            <button
              onClick={() => { playClickSound(); setActiveFilter('friends'); }}
              className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black transition-all text-center shrink-0 sm:flex-1 ${
                activeFilter === 'friends'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>เพื่อน</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {(friends || []).filter(f => f.isFriend).length}
              </span>
            </button>

            <button
              onClick={() => { playClickSound(); setActiveFilter('groups'); }}
              className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black transition-all text-center shrink-0 sm:flex-1 ${
                activeFilter === 'groups'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กลุ่ม
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {(groups || []).filter(g => g.isJoined).length}
              </span>
            </button>

            <button
              onClick={() => { playClickSound(); setActiveFilter('announcements'); }}
              className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-black transition-all text-center shrink-0 sm:flex-1 ${
                activeFilter === 'announcements'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ประกาศ
            </button>
          </div>

          {/* TAB 1: FEED VIEW */}
          {activeFilter === 'feed' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* POST CREATION BAR */}
              <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 border border-slate-200 space-y-2.5">
                <form onSubmit={handleCreatePost} className="flex items-center gap-2.5">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-200 overflow-hidden flex items-center justify-center shrink-0">
                    {profile.customAvatarImage ? (
                      <img src={profile.customAvatarImage} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{profile.avatar || '👧'}</span>
                    )}
                  </div>

                  {/* Input Box */}
                  <input
                    type="text"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="แชร์เรื่องราวหรือความสำเร็จของคุณ..."
                    className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                  />

                  {/* Hidden file input for real image upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Camera Icon Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 transition rounded-xl ${
                      attachedImage ? 'text-emerald-600 bg-emerald-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                    }`}
                    title="แนบรูปภาพจากเครื่อง"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Green Post Button */}
                  <button
                    type="submit"
                    disabled={!newPostText.trim() && !attachedImage && !selectedHighlightLevel}
                    className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all shadow-sm ${
                      newPostText.trim() || attachedImage || selectedHighlightLevel
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    โพสต์
                  </button>
                </form>

                {/* Optional Attached Image Preview */}
                {attachedImage && (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-slate-900 max-h-36 flex items-center justify-center">
                    <img src={attachedImage} alt="Preview" className="max-h-36 w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                      title="ลบรูปภาพ"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Badges / Achievement Attach Tag */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar text-[11px]">
                  <span className="text-slate-400 font-bold shrink-0">แชร์ด่าน:</span>
                  {[1, 2, 3, 4, 5, 6].map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedHighlightLevel(selectedHighlightLevel === stg ? null : stg);
                      }}
                      className={`px-2 py-0.5 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                        selectedHighlightLevel === stg
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200/80 hover:bg-slate-300 text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>ด่าน {stg}</span>
                    </button>
                  ))}
                  {selectedHighlightLevel && (
                    <button
                      type="button"
                      onClick={() => setSelectedHighlightLevel(null)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* FEED POSTS LIST */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div 
                    key={post.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 transition space-y-3 relative"
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-100 to-pink-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xl shadow-xs shrink-0">
                          {post.customAvatarImage ? (
                            <img src={post.customAvatarImage} alt={post.author} className="w-full h-full object-cover" />
                          ) : (
                            <span>{post.avatar}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-800">
                              {post.author}
                            </span>
                            {post.isMyPost && (
                              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                                คุณ
                              </span>
                            )}
                            {post.badgeTag && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                                {post.badgeTag}
                              </span>
                            )}
                            {post.levelText && (
                              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {post.levelText}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {post.timeAgo}
                          </span>
                        </div>
                      </div>

                      {/* More Options Button */}
                      <div className="relative">
                        <button 
                          onClick={() => {
                            playClickSound();
                            setOpenOptionsMenuPostId(openOptionsMenuPostId === post.id ? null : post.id);
                          }}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition"
                          title="ตัวเลือกเพิ่มเติม"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openOptionsMenuPostId === post.id && (
                          <div className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-30 animate-fadeIn">
                            <button
                              onClick={() => handleCopyPost(post.content)}
                              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>คัดลอกข้อความ</span>
                            </button>

                            <button
                              onClick={() => handleSharePost(post)}
                              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>แชร์ไปยังเพื่อน</span>
                            </button>

                            {post.isMyPost ? (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition border-t border-slate-100"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>ลบโพสต์ของฉัน</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setOpenOptionsMenuPostId(null);
                                  onShowToast('🚩 รายงานโพสต์แล้ว', 'ทีมงานจะตรวจสอบความเหมาะสมโดยเร็ว');
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition border-t border-slate-100"
                              >
                                <Flag className="w-3.5 h-3.5 text-amber-500" />
                                <span>รายงานความไม่เหมาะสม</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Highlight Card (e.g. ผ่านด่านที่ 4) */}
                    {post.highlightCard && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-2xl p-3 border border-blue-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-black text-xs text-indigo-950 block">
                            {post.highlightCard.title}
                          </span>
                          <span className="text-[11px] text-slate-600 truncate block">
                            {post.highlightCard.subtitle}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < post.highlightCard!.stars ? 'fill-amber-400' : 'text-slate-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Banner */}
                    {post.imageBanner && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-900 max-h-56 flex items-center justify-center">
                        <img 
                          src={post.imageBanner} 
                          alt="Banner" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Post Footer: Likes & Comments & Share */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 transition active:scale-110 ${
                            post.likedByUser ? 'text-rose-500 font-black' : 'hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 transition ${post.likedByUser ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                          <span>{post.likes}</span>
                        </button>

                        {/* Comment Button */}
                        <button
                          onClick={() => {
                            playClickSound();
                            setSelectedPostComments(post);
                          }}
                          className="flex items-center gap-1.5 hover:text-indigo-600 transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentsCount}</span>
                        </button>
                      </div>

                      {/* Share Button */}
                      <button 
                        onClick={() => handleSharePost(post)}
                        className="hover:text-emerald-600 p-1 rounded-lg hover:bg-slate-50 transition"
                        title="แชร์โพสต์"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Inline Comment Preview if has comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div 
                        onClick={() => {
                          playClickSound();
                          setSelectedPostComments(post);
                        }}
                        className="bg-slate-50/80 rounded-xl p-2 text-[11px] text-slate-600 cursor-pointer hover:bg-slate-100 transition flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-slate-800">{post.comments[post.comments.length - 1].user}: </span>
                          <span>{post.comments[post.comments.length - 1].text}</span>
                        </div>
                        <span className="text-[10px] text-blue-600 shrink-0 font-bold">ดูทั้งหมด</span>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB: UNIFIED TEACHER HUB (ส่งงาน & คุยกับคุณครู) */}
          {activeFilter === 'teacher_hub' && (
            <CommunityTeacherHub
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              onShowToast={onShowToast}
              onNavigateTab={onNavigateTab}
            />
          )}

          {/* TAB 2: FRIENDS VIEW */}
          {activeFilter === 'friends' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Search Friends Bar */}
              <div className="relative">
                <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  placeholder="ค้นหาเพื่อนในห้องเรียน หรือฉายานักสืบ..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* My Friends Section */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span>เพื่อนของฉัน</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                      {friends.filter(f => f.isFriend).length} คน
                    </span>
                  </h4>
                  <span className="text-[10px] text-slate-400">ออนไลน์พร้อมกัน</span>
                </div>

                <div className="space-y-2">
                  {filteredFriends.filter(f => f.isFriend).map(friend => (
                    <div
                      key={friend.id}
                      className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-200 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-amber-100 border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                            {friend.avatar}
                          </div>
                          {friend.isOnline && (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0 shadow-xs" title="ออนไลน์อยู่" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-black text-xs text-slate-800 truncate">{friend.name}</h5>
                            <span className="text-[10px] font-bold text-amber-500 flex items-center">
                              <Star className="w-2.5 h-2.5 fill-amber-400" /> Lv.{friend.level}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{friend.statusText}</p>
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                            {friend.badge}
                          </span>
                        </div>
                      </div>

                      {/* Interaction Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSendWave(friend.name)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                          title="ส่งการทักทาย 👋"
                        >
                          <span className="text-xs">👋</span>
                        </button>
                        <button
                          onClick={() => handleSendHeart(friend.name)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          title="ส่งหัวใจพลังบวก ❤️"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        </button>
                        <button
                          onClick={() => handleToggleFriend(friend.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-bold transition"
                        >
                          เพื่อนแล้ว
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Friends Section */}
              <div className="pt-2">
                <h4 className="text-xs font-black text-slate-800 mb-2 px-1">
                  แนะนำเพื่อนร่วมชั้นเรียน ป.5
                </h4>
                <div className="space-y-2">
                  {filteredFriends.filter(f => !f.isFriend).map(friend => (
                    <div
                      key={friend.id}
                      className="bg-slate-50/70 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xl shrink-0">
                          {friend.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-black text-xs text-slate-800 truncate">{friend.name}</h5>
                            <span className="text-[10px] text-amber-500 font-bold">Lv.{friend.level}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{friend.badge}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleFriend(friend.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>เพิ่มเพื่อน</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: GROUPS VIEW */}
          {activeFilter === 'groups' && (
            <div className="space-y-3 animate-fadeIn">
              
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black text-emerald-950">ชมรมและกลุ่มกิจกรรมการสืบค้น</h4>
                  <p className="text-[10px] text-emerald-700">เข้าร่วมกลุ่มเพื่อแลกเปลี่ยนสูตรค้นหา และทำภารกิจร่วมกัน</p>
                </div>
              </div>

              <div className="space-y-3">
                {groups.map(group => (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
                          {group.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="font-black text-xs sm:text-sm text-slate-800">
                              {group.name}
                            </h5>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                              {group.tag}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3 text-slate-400" />
                            สมาชิก {group.membersCount} คน
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleGroup(group.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 shrink-0 ${
                          group.isJoined
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        {group.isJoined ? 'เป็นสมาชิกแล้ว ✓' : '+ เข้าร่วมกลุ่ม'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {group.desc}
                    </p>

                    {group.isJoined && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                        <span>💬 มี 3 กระทู้สนทนาใหม่อ่านในสัปดาห์นี้</span>
                        <button 
                          onClick={() => {
                            playClickSound();
                            setNewPostText(`[${group.name}] สวัสดีเพื่อนๆ ในกลุ่มครับ!`);
                            setActiveFilter('feed');
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          โพสต์คุยในกลุ่ม &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: ANNOUNCEMENTS VIEW */}
          {activeFilter === 'announcements' && (
            <div className="space-y-3 animate-fadeIn">
              
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>ประกาศทางการและข่าวสารห้องเรียน</span>
                </h4>
                <span className="text-[10px] text-slate-400">อัปเดตล่าสุดสัปดาห์นี้</span>
              </div>

              <div className="space-y-3">
                {announcements.map(announcement => (
                  <div
                    key={announcement.id}
                    className={`rounded-2xl p-4 border shadow-xs space-y-2.5 transition ${
                      announcement.isPinned
                        ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border-amber-200'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xl shadow-xs">
                          {announcement.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-slate-800">{announcement.author}</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                              {announcement.badgeTag}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{announcement.date}</span>
                        </div>
                      </div>

                      {announcement.isPinned && (
                        <span className="px-2 py-1 rounded-xl bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-amber-600 text-amber-600" />
                          ปักหมุด
                        </span>
                      )}
                    </div>

                    <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                      {announcement.title}
                    </h5>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {announcement.content}
                    </p>

                    <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600">
                        #{announcement.tag}
                      </span>
                      <button 
                        onClick={() => {
                          playClickSound();
                          onShowToast('👍 รับทราบข่าวสาร', 'ขอบคุณที่ติดตามประกาศจากห้องเรียน');
                        }}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        กดรับทราบ ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* FLOATING ACTION BUTTON: ➕ Green Button at bottom-right (only in feed) */}
      {activeFilter === 'feed' && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-30">
          <button
            onClick={() => {
              playClickSound();
              const text = prompt('พิมพ์เรื่องราวที่คุณต้องการแชร์สู่ชุมชน:');
              if (text && text.trim()) {
                setNewPostText(text);
                setActiveFilter('feed');
                setTimeout(() => handleCreatePost(), 100);
              }
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition border-2 border-white"
            title="สร้างโพสต์ใหม่"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {selectedPostComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border-2 border-emerald-200 text-slate-800 space-y-4 max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base">ความคิดเห็น ({selectedPostComments.commentsCount})</h3>
              </div>
              <button
                onClick={() => setSelectedPostComments(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Snippet in Comments Modal */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
              <span className="text-xl shrink-0">{selectedPostComments.avatar}</span>
              <div className="min-w-0">
                <span className="font-black text-slate-800 block">{selectedPostComments.author}</span>
                <p className="text-slate-600 line-clamp-2">{selectedPostComments.content}</p>
              </div>
            </div>

            {/* List of comments */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {selectedPostComments.comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  ยังไม่มีความคิดเห็น มาเป็นคนแรกที่ส่งกำลังใจให้เพื่อนกันเถอะ!
                </div>
              ) : (
                selectedPostComments.comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 flex items-center gap-1">
                        <span>{c.avatar || '👤'}</span> {c.user}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-slate-600 pl-4">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Quick Emoji Reaction pills */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              {['👍 เยี่ยมมาก!', '🎉 ยินดีด้วยนะ', '💡 ได้ความรู้ใหม่', '❤️ สู้ๆ', '👏 เก่งจัง'].map((quickEmoji) => (
                <button
                  key={quickEmoji}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setCommentInput(prev => prev ? `${prev} ${quickEmoji}` : quickEmoji);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 text-[11px] font-bold text-slate-600 hover:text-emerald-700 transition shrink-0"
                >
                  {quickEmoji}
                </button>
              ))}
            </div>

            {/* Add comment input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="เขียนความคิดเห็นหรือส่งกำลังใจ..."
                className="flex-1 bg-slate-100 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentInput.trim()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

