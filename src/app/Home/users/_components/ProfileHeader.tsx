"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";
import { UserDataType } from "@/lib/types";
import { API } from "@/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  user: UserDataType;
  currentUserId: string;
  onUserDataUpdate?: (user: UserDataType) => void;
};

export default function ProfileHeader({ user, currentUserId, onUserDataUpdate }: Props) {
  const [isFollowing, setIsFollowing] = useState<boolean>(
    user.followers?.some(f => f === currentUserId) || false
  );
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalUsers, setModalUsers] = useState<{ _id: string; username: string }[]>([]);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<{
      _id?: string;
      avatarImage?: string;
      followers?: string[];
      following?: string[];
      posts?: string[];
    } | null>(null);

    const handleFollow = async () => {
      if (currentUserId === user._id) {
        toast.error("Өөрийгөө дагах боломжгүй");
        return;
      }
    
      setIsLoading(true);
      
      try {
        const endpoint = isFollowing ? "/api/unfollow" : "/api/follow";
        const response = await axios.post(`${API}${endpoint}`, {
          followerId: currentUserId,
          followingId: user._id
        }, {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
    
        toast.success(response.data.message);
        setIsFollowing(!isFollowing);
        
        // Дагагчдын жагсаалтыг шинэчлэх
        const userRes = await axios.get(`${API}/api/users/${user._id}`);
        setUserData(userRes.data);
        onUserDataUpdate?.(userRes.data); 
        
      } catch (error: any) {
        console.error("Алдаа:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Алдаа гарлаа");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (userData?.followers?.includes(currentUserId)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    }, [userData?.followers, currentUserId]);
    

  useEffect(() => {
    const fetchModalUsers = async () => {
      if (!userData || !modalType) return;
  
      const ids = modalType === "followers" ? userData.followers : userData.following;

      if (!ids) {
        console.error("Followers or Following list is undefined");
        return;
      }
  
      try {
        const users = await Promise.all(
          ids.map(async (id) => {
            const res = await axios.get(`${API}/api/users/${id}`);
            return { _id: id, username: res.data.username };
          })
        );
        setModalUsers(users);
      } catch (err) {
        console.error("Failed to fetch modal users:", err);
        toast.error("Хэрэглэгчийн мэдээллийг татахад алдаа гарлаа!");
      }
    };
  
    if (isModalOpen) {
      fetchModalUsers();
    }
    
  }, [isModalOpen, modalType, userData]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API}/api/users/${user._id}`);
        setUserData(res.data); 
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Хэрэглэгчийн мэдээллийг татахад алдаа гарлаа!");
      }
    };
  
    fetchUserData();
  }, [user._id]); 

  return (
    <div className="flex flex-col ml-[20px] gap-[30px]">
      <div className="text-[20px] font-normal flex flex-row items-center gap-[8px]">
        <div>{user.username}</div>
        <Button
          className={`${isFollowing ? 'bg-gray-200' : 'bg-blue-400'} text-white`}
          onClick={handleFollow}
          disabled={isLoading || currentUserId === user._id}
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : isFollowing ? (
            "Unfollow"
          ) : (
            "Follow"
          )}
        </Button>
        <Button variant="secondary" className="hover:bg-gray-200">
          Message
        </Button>
      </div>
      <div className="text-[16px] text-gray-400 flex gap-8">
        <div>
          {userData?.posts?.length || 0} posts
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            setModalType("followers");
            setIsModalOpen(true);
          }}
        >
          {userData?.followers?.length || 0} followers
        </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            setModalType("following");
            setIsModalOpen(true);
          }}
        >
          {userData?.following?.length || 0} following
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
            {modalType === "followers" ? "Followers" : "Following"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
          {modalUsers.map((user) => (
            <div key={user._id} className="py-2 border-b">
              @{user.username}
            </div>
          ))}
          </div>
        </DialogContent>
      </Dialog>
      <div className="text-[16px] text-gray-500">
        {user.bio || "No bio yet"}
      </div>
    </div>
  );
}
