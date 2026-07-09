import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PP, PP_BORDER, PP_FONT, ppText } from '../../constants/pixelPopTheme';
import { PPModal } from './PPModal';
import { PixelIcon } from './PixelIcon';

const AVATAR_PALETTE = ['#FF6B9D', '#4ECDC4', '#A8E6CF', '#FFB347', '#C3B1E1', '#87CEEB', '#FFD700', '#98FB98'];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

interface MembersModalProps {
  visible: boolean;
  onClose: () => void;
  memberIds: string[];
  memberNames?: Record<string, string>;
  ownerId: string;
  currentUserId: string;
}

export function MembersModal({ visible, onClose, memberIds, memberNames, ownerId, currentUserId }: MembersModalProps) {
  const { t } = useTranslation();
  const profiles = [...memberIds]
    .sort((a, b) => {
      if (a === ownerId) return -1;
      if (b === ownerId) return 1;
      const nameA = memberNames?.[a] ?? a;
      const nameB = memberNames?.[b] ?? b;
      return nameA.localeCompare(nameB);
    })
    .map((id) => ({ id, displayName: memberNames?.[id] ?? id }));

  return (
    <PPModal visible={visible} onClose={onClose} title={t('members.title')}>
      <View style={styles.list}>
        {profiles.map((p) => {
          const isOwner = p.id === ownerId;
          const isMe = p.id === currentUserId;
          const initial = (p.displayName?.[0] ?? '?').toUpperCase();
          return (
            <View key={p.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: avatarColor(p.id) }]}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
              <Text style={[ppText.rowBody, styles.name]} numberOfLines={1}>
                {p.displayName}
              </Text>
              {isMe && <Text style={styles.badge}>{t('members.you')}</Text>}
              {isOwner && (
                <View style={styles.ownerBadge}>
                  <PixelIcon name="star" size={10} color={PP.ink} />
                </View>
              )}
            </View>
          );
        })}
        {profiles.length === 0 && (
          <Text style={[ppText.meta, { textAlign: 'center', paddingVertical: 12 }]}>{t('members.empty')}</Text>
        )}
      </View>
    </PPModal>
  );
}

const styles = StyleSheet.create({
  list: { gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: PP_BORDER.thin,
    borderBottomColor: PP.ink + '22',
  },
  avatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: PP_BORDER.base,
    borderColor: PP.ink,
  },
  avatarLetter: { fontFamily: PP_FONT.display, fontSize: 14, color: PP.ink },
  name: { flex: 1 },
  badge: {
    fontFamily: PP_FONT.display,
    fontSize: 8,
    color: PP.paper,
    backgroundColor: PP.ink,
    paddingHorizontal: 5,
    paddingVertical: 2,
    letterSpacing: 0.5,
  },
  ownerBadge: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderWidth: PP_BORDER.base,
    borderColor: PP.ink,
  },
});
