import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../models/comment';

interface CommentsViewProps {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  onAddComment: (text: string) => Promise<void>;
}

export const CommentsView: React.FC<CommentsViewProps> = ({ 
  comments, 
  isLoading, 
  error,
  onAddComment 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setIsAddingComment(true);
      await onAddComment(newComment.trim());
      setNewComment('');
      setShowCommentInput(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{item.displayName}</Text>
        <Text style={styles.commentDate}>{item.formattedDate}</Text>
      </View>
      <Text style={styles.commentText}>{item.displayText}</Text>
    </View>
  );

  if (isLoading && comments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        }
      />

      <Pressable
        style={styles.addButton}
        onPress={() => setShowCommentInput(true)}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Comment</Text>
      </Pressable>

      <Modal
        visible={showCommentInput}
        animationType="slide"
        transparent={false}
        presentationStyle="formSheet"
        onRequestClose={() => {
          setShowCommentInput(false);
          setNewComment('');
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => {
                  setShowCommentInput(false);
                  setNewComment('');
                }}
                disabled={isAddingComment}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <Pressable
                onPress={handleAddComment}
                disabled={isAddingComment || !newComment.trim()}
              >
                {isAddingComment ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={[styles.postText, (!newComment.trim() || isAddingComment) && styles.disabledText]}>Post</Text>
                )}
              </Pressable>
            </View>
            
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Write your comment here..."
                placeholderTextColor="#9ea3b0"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                editable={!isAddingComment}
                autoFocus
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{newComment.length}/500</Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  commentCard: {
    backgroundColor: '#1e2127',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  commentDate: {
    fontSize: 14,
    color: '#9ea3b0',
  },
  commentText: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#9ea3b0',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3d434d',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  postText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledText: {
    color: '#666',
  },
  modalInputContainer: {
    flex: 1,
    padding: 16,
  },
  modalInput: {
    flex: 1,
    backgroundColor: '#1e2127',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d434d',
    fontSize: 16,
    lineHeight: 24,
  },
  characterCount: {
    textAlign: 'right',
    color: '#9ea3b0',
    fontSize: 12,
    marginTop: 8,
  },
});