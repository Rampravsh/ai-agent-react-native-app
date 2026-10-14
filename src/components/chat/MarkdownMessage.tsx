/**
 * MarkdownMessage Component - Muse AI Clone
 *
 * Renders structured markdown for AI companion messages:
 * - Dynamic headings (#, ##, ###) with balanced typography
 * - Bold (**text**) & Italic (*text*) styling
 * - Inline code (`code`) and multi-line code blocks (```lang\ncode\n```)
 * - Custom bullet lists (- item) & numbered lists (1. item)
 * - Clickable links ([title](url) & raw URLs)
 * - Streaming safe: never crashes on incomplete markdown tokens
 * - Blinking cursor indicator while Cooper is streaming
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
  onLinkPress?: (url: string) => void;
  isStreaming?: boolean;
}

interface InlineToken {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link';
  text: string;
  url?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  isUser = false,
  onLinkPress,
  isStreaming = false,
}) => {
  // Parse inline elements (bold, italic, inline code, links)
  const parseInline = (text: string): InlineToken[] => {
    if (!text) return [];

    const tokens: InlineToken[] = [];
    // Regex matching:
    // 1. [title](url)
    // 2. `code`
    // 3. **bold**
    // 4. *italic*
    // 5. https?://... raw url
    const regex = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: 'text',
          text: text.slice(lastIndex, match.index),
        });
      }

      const raw = match[0];

      if (raw.startsWith('[') && raw.includes('](')) {
        const linkMatch = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          tokens.push({
            type: 'link',
            text: linkMatch[1],
            url: linkMatch[2],
          });
        } else {
          tokens.push({ type: 'text', text: raw });
        }
      } else if (raw.startsWith('`') && raw.endsWith('`') && raw.length >= 2) {
        tokens.push({
          type: 'code',
          text: raw.slice(1, -1),
        });
      } else if (raw.startsWith('**') && raw.endsWith('**') && raw.length >= 4) {
        tokens.push({
          type: 'bold',
          text: raw.slice(2, -2),
        });
      } else if (raw.startsWith('*') && raw.endsWith('*') && raw.length >= 2) {
        tokens.push({
          type: 'italic',
          text: raw.slice(1, -1),
        });
      } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
        tokens.push({
          type: 'link',
          text: raw,
          url: raw,
        });
      } else {
        tokens.push({ type: 'text', text: raw });
      }

      lastIndex = match.index + raw.length;
    }

    if (lastIndex < text.length) {
      tokens.push({
        type: 'text',
        text: text.slice(lastIndex),
      });
    }

    return tokens;
  };

  const renderInlineTokens = (tokens: InlineToken[], baseStyle: any) => {
    return tokens.map((token, index) => {
      switch (token.type) {
        case 'bold':
          return (
            <Text
              key={index}
              style={[
                baseStyle,
                isUser ? styles.userBold : styles.agentBold,
              ]}>
              {token.text}
            </Text>
          );
        case 'italic':
          return (
            <Text
              key={index}
              style={[baseStyle, styles.italic]}>
              {token.text}
            </Text>
          );
        case 'code':
          return (
            <Text
              key={index}
              style={[
                styles.inlineCode,
                isUser ? styles.userInlineCode : styles.agentInlineCode,
              ]}>
              {token.text}
            </Text>
          );
        case 'link':
          return (
            <Text
              key={index}
              style={[
                baseStyle,
                styles.link,
                isUser && styles.userLink,
              ]}
              onPress={() => token.url && onLinkPress?.(token.url)}>
              {token.text}
            </Text>
          );
        default:
          return (
            <Text key={index} style={baseStyle}>
              {token.text}
            </Text>
          );
      }
    });
  };

  // Block parsing (code blocks, headers, bullet lists, numbers, horizontal rules, quotes, paragraphs)
  const blocks = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const result: Array<{
      type:
        | 'h1'
        | 'h2'
        | 'h3'
        | 'codeblock'
        | 'bullet'
        | 'numbered'
        | 'quote'
        | 'hr'
        | 'paragraph';
      text: string;
      number?: string;
      language?: string;
    }> = [];

    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check code block fence
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          result.push({
            type: 'codeblock',
            text: codeBuffer.join('\n'),
            language: codeLanguage,
          });
          codeBuffer = [];
          codeLanguage = '';
          inCodeBlock = false;
        } else {
          // Opening code block
          inCodeBlock = true;
          codeLanguage = trimmed.replace('```', '').trim();
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (!trimmed) {
        // Empty line separator
        continue;
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        result.push({ type: 'hr', text: '' });
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        result.push({ type: 'h1', text: line.replace(/^#\s+/, '') });
        continue;
      }
      if (line.startsWith('## ')) {
        result.push({ type: 'h2', text: line.replace(/^##\s+/, '') });
        continue;
      }
      if (line.startsWith('### ')) {
        result.push({ type: 'h3', text: line.replace(/^###\s+/, '') });
        continue;
      }

      // Blockquotes
      if (line.startsWith('>')) {
        result.push({ type: 'quote', text: line.replace(/^>\s*/, '') });
        continue;
      }

      // Bullet lists (- or *)
      if (/^[-*]\s+/.test(line)) {
        result.push({ type: 'bullet', text: line.replace(/^[-*]\s+/, '') });
        continue;
      }

      // Numbered lists (1. 2. etc)
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        result.push({
          type: 'numbered',
          number: numMatch[1],
          text: numMatch[2],
        });
        continue;
      }

      // Default regular paragraph
      result.push({ type: 'paragraph', text: line });
    }

    // Unclosed code block if streaming incomplete
    if (inCodeBlock && codeBuffer.length > 0) {
      result.push({
        type: 'codeblock',
        text: codeBuffer.join('\n'),
        language: codeLanguage,
      });
    }

    return result;
  }, [content]);

  const baseTextStyle = isUser ? styles.userText : styles.agentText;

  return (
    <View style={styles.container}>
      {blocks.map((block, idx) => {
        const isLastBlock = idx === blocks.length - 1;

        switch (block.type) {
          case 'h1':
            return (
              <View key={idx} style={styles.h1Wrapper}>
                <Text style={[styles.h1, isUser ? styles.userH1 : styles.agentH1]}>
                  {block.text}
                </Text>
              </View>
            );

          case 'h2':
            return (
              <View key={idx} style={styles.h2Wrapper}>
                <Text style={[styles.h2, isUser ? styles.userH2 : styles.agentH2]}>
                  {block.text}
                </Text>
              </View>
            );

          case 'h3':
            return (
              <View key={idx} style={styles.h3Wrapper}>
                <Text style={[styles.h3, isUser ? styles.userH3 : styles.agentH3]}>
                  {block.text}
                </Text>
              </View>
            );

          case 'bullet':
            return (
              <View key={idx} style={styles.listRow}>
                <View
                  style={[
                    styles.bulletDot,
                    isUser ? styles.userBulletDot : styles.agentBulletDot,
                  ]}
                />
                <Text style={[styles.listContentText, baseTextStyle]}>
                  {renderInlineTokens(parseInline(block.text), baseTextStyle)}
                  {isLastBlock && isStreaming && <Text style={styles.cursor}> ▍</Text>}
                </Text>
              </View>
            );

          case 'numbered':
            return (
              <View key={idx} style={styles.listRow}>
                <Text
                  style={[
                    styles.listNumber,
                    isUser ? styles.userListNumber : styles.agentListNumber,
                  ]}>
                  {block.number}.
                </Text>
                <Text style={[styles.listContentText, baseTextStyle]}>
                  {renderInlineTokens(parseInline(block.text), baseTextStyle)}
                  {isLastBlock && isStreaming && <Text style={styles.cursor}> ▍</Text>}
                </Text>
              </View>
            );

          case 'quote':
            return (
              <View
                key={idx}
                style={[
                  styles.quoteBox,
                  isUser ? styles.userQuoteBox : styles.agentQuoteBox,
                ]}>
                <Text style={[baseTextStyle, styles.quoteText]}>
                  {renderInlineTokens(parseInline(block.text), baseTextStyle)}
                </Text>
              </View>
            );

          case 'hr':
            return (
              <View
                key={idx}
                style={[
                  styles.hr,
                  isUser ? styles.userHr : styles.agentHr,
                ]}
              />
            );

          case 'codeblock':
            return (
              <View key={idx} style={styles.codeBlockWrapper}>
                {Boolean(block.language) && (
                  <View style={styles.codeHeader}>
                    <Text style={styles.codeLangText}>{block.language}</Text>
                  </View>
                )}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={styles.codeContent}>{block.text}</Text>
                </ScrollView>
              </View>
            );

          case 'paragraph':
          default:
            return (
              <View key={idx} style={styles.paragraphWrapper}>
                <Text style={baseTextStyle}>
                  {renderInlineTokens(parseInline(block.text), baseTextStyle)}
                  {isLastBlock && isStreaming && <Text style={styles.cursor}> ▍</Text>}
                </Text>
              </View>
            );
        }
      })}

      {/* Trailing streaming cursor if message is empty and starting stream */}
      {isStreaming && blocks.length === 0 && (
        <Text style={[baseTextStyle, styles.cursor]}>▍</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraphWrapper: {
    marginBottom: 6,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#26170D',
  },
  agentText: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.iconDark,
  },
  userBold: {
    fontWeight: '700',
    color: '#1A0E07',
  },
  agentBold: {
    fontWeight: '700',
    color: Colors.text,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  userLink: {
    color: '#8B3E14',
    textDecorationLine: 'underline',
  },
  h1Wrapper: {
    marginTop: 8,
    marginBottom: 6,
  },
  h1: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  userH1: {
    color: '#26170D',
  },
  agentH1: {
    color: Colors.text,
  },
  h2Wrapper: {
    marginTop: 8,
    marginBottom: 5,
  },
  h2: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  userH2: {
    color: '#26170D',
  },
  agentH2: {
    color: Colors.text,
  },
  h3Wrapper: {
    marginTop: 6,
    marginBottom: 4,
  },
  h3: {
    fontSize: 15,
    fontWeight: '700',
  },
  userH3: {
    color: '#26170D',
  },
  agentH3: {
    color: Colors.text,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 8,
  },
  agentBulletDot: {
    backgroundColor: Colors.primary,
  },
  userBulletDot: {
    backgroundColor: '#8B3E14',
  },
  listNumber: {
    fontSize: 14.5,
    fontWeight: '700',
    marginRight: 6,
    minWidth: 16,
  },
  agentListNumber: {
    color: Colors.primary,
  },
  userListNumber: {
    color: '#8B3E14',
  },
  listContentText: {
    flex: 1,
  },
  quoteBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginVertical: 6,
  },
  agentQuoteBox: {
    borderLeftColor: Colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    paddingVertical: 4,
    borderRadius: 4,
  },
  userQuoteBox: {
    borderLeftColor: '#A85A36',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingVertical: 4,
    borderRadius: 4,
  },
  quoteText: {
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  hr: {
    height: 1,
    marginVertical: 10,
  },
  agentHr: {
    backgroundColor: Colors.border,
  },
  userHr: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13.5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  agentInlineCode: {
    backgroundColor: '#E2E8F0',
    color: '#0F172A',
  },
  userInlineCode: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#1A0E07',
  },
  codeBlockWrapper: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  codeHeader: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  codeLangText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  codeContent: {
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 19,
    padding: 12,
  },
  cursor: {
    color: Colors.primary,
    fontWeight: '900',
    fontSize: 14,
  },
});

export default MarkdownMessage;
