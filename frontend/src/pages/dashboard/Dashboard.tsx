import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Presentation {
  _id: string;
  title: string;
  themeId?: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch presentations
  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const res = await api.get("/presentations/get-all-presentations-for-user");
        setPresentations(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load presentations");
      } finally {
        setLoading(false);
      }
    };
    fetchPresentations();
  }, []);

  // Delete presentation
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/presentations/delete/${id}`);
      setPresentations((prev) => prev.filter((p) => p._id !== id));
      toast.success("Presentation deleted");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting presentation");
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/editor/${id}`; // Navigate to editor
  };

  const handleView = (id: string) => {
    window.location.href = `/presentation/${id}`; // Navigate to viewer
  };

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Presentations</h1>
          <Button onClick={() => (window.location.href = "/editor")}>+ New Presentation</Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg">No presentations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation) => (
              <Card key={presentation._id} className="hover:shadow-lg transition-all border">
                <CardHeader>
                  <CardTitle className="truncate">{presentation.title}</CardTitle>
                  <CardDescription>
                    Created: {new Date(presentation.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(presentation.updatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(presentation._id)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleView(presentation._id)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </div>

                  {/* Delete confirmation dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this presentation?</AlertDialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          This action cannot be undone.
                        </p>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(presentation._id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
