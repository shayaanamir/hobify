import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Keyboard } from 'react-native';
import { Search, X, Image as ImageIcon } from 'lucide-react-native';
import { searchMedia } from '../services/mediaSearchService';

export function MediaSearchInput({ 
  value, 
  onChangeText, 
  onSelectMedia, 
  searchType, 
  placeholder,
  icon: Icon
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Sync internal query with external value if it changes
  useEffect(() => {
    if (value && value !== query && !showDropdown) {
      setQuery(value);
    }
  }, [value]);

  const handleTextChange = (text) => {
    setQuery(text);
    onChangeText(text); // Let parent know about manual typing (custom entry)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchMedia(text, searchType);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  };

  const handleSelect = (item) => {
    setQuery(item.title);
    setShowDropdown(false);
    Keyboard.dismiss();
    onSelectMedia(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    onChangeText('');
    onSelectMedia(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        {Icon ? <Icon size={16} color="#9CA3AF" style={styles.icon} /> : <Search size={16} color="#9CA3AF" style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={handleTextChange}
          onFocus={() => {
            if (query.trim().length >= 2) setShowDropdown(true);
          }}
        />
        {loading ? (
          <ActivityIndicator size="small" color="#9CA3AF" style={styles.rightIcon} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={handleClear} style={styles.rightIcon}>
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {results.length > 0 ? (
            <ScrollView style={styles.resultsList} keyboardShouldPersistTaps="handled">
              {results.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  {item.coverUrl ? (
                    <Image source={{ uri: item.coverUrl }} style={styles.coverImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <ImageIcon size={16} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.resultSubtitle} numberOfLines={1}>
                      {item.subtitle} {item.releaseYear ? `(${item.releaseYear})` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : !loading && query.length >= 2 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No results found.</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Text style={styles.customTextBtn}>Use custom title "{query}"</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: { marginRight: 8 },
  rightIcon: { marginLeft: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: 250,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resultsList: {
    padding: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  coverImage: {
    width: 32,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  placeholderImage: {
    width: 32,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  customTextBtn: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  }
});
