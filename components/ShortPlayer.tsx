import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView, type VideoPlayer } from 'expo-video';
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionRail } from '@/components/ActionRail';
import { Icon } from '@/components/Icon';
import { Poster } from '@/components/Poster';
import { colors, gradients } from '@/constants/theme';
import { usePlayback } from '@/context/Playback';
import type { Episode, Series } from '@/data/catalog';

type ShortPageProps = {
  show: Series;
  episode: Episode;
  height: number;
  near: boolean;
  active: boolean;
  startAt?: number;
  loop?: boolean;
  playbackRate?: number;
  trackProgress?: boolean;
  bottomInset?: number;
  info: ReactNode;
  onEpisodes: () => void;
  onEnded?: () => void;
};

export function ShortPage(props: ShortPageProps) {
  if (!props.near) {
    return (
      <View style={[styles.page, { height: props.height }]}>
        <Poster show={props.show} radius={0} showBadge={false} showMeta={false} style={styles.fill} />
      </View>
    );
  }
  return <ShortPlayer {...props} />;
}

function ShortPlayer({
  show,
  episode,
  height,
  active,
  startAt = 0,
  loop = false,
  playbackRate = 1,
  trackProgress = false,
  bottomInset = 0,
  info,
  onEpisodes,
  onEnded,
}: ShortPageProps) {
  const { markProgress } = usePlayback();
  const player = useVideoPlayer(episode.videoUrl, (instance) => {
    instance.timeUpdateEventInterval = 0.25;
    instance.loop = loop;
  });
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(episode.durationSec);
  const [trackWidth, setTrackWidth] = useState(1);
  const [wasActive, setWasActive] = useState(active);
  const startedRef = useRef(false);
  const handleEnded = useEffectEvent(() => onEnded?.());

  if (active !== wasActive) {
    setWasActive(active);
    setUserPaused(false);
  }

  useEffect(() => {
    const subs = [
      player.addListener('playingChange', ({ isPlaying }) => setPlaying(isPlaying)),
      player.addListener('timeUpdate', ({ currentTime }) => setPosition(currentTime)),
      player.addListener('sourceLoad', ({ duration: loaded }) => {
        if (loaded > 0) setDuration(loaded);
      }),
      player.addListener('statusChange', ({ status }) => {
        setLoading(status === 'loading');
        setFailed(status === 'error');
      }),
      player.addListener('playToEnd', () => handleEnded()),
    ];
    return () => subs.forEach((sub) => sub.remove());
  }, [player]);

  useEffect(() => {
    setRate(player, playbackRate);
  }, [player, playbackRate]);

  useEffect(() => {
    if (active) {
      if (!startedRef.current) {
        startedRef.current = true;
        if (startAt > 1) seek(player, startAt);
      } else if (player.duration > 0 && player.currentTime >= player.duration - 0.3) {
        seek(player, 0);
      }
      player.play();
    } else {
      player.pause();
    }
  }, [active, player, startAt]);

  useEffect(() => {
    if (!trackProgress || !active || !playing) return;
    const handle = setInterval(() => {
      markProgress(show.id, episode.id, player.currentTime);
    }, 2000);
    return () => {
      clearInterval(handle);
      markProgress(show.id, episode.id, player.currentTime);
    };
  }, [active, episode.id, markProgress, player, playing, show.id, trackProgress]);

  const ratio = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <View style={[styles.page, { height }]}>
      <Pressable
        style={styles.fill}
        onPress={() => {
          if (playing) {
            setUserPaused(true);
            player.pause();
          } else {
            setUserPaused(false);
            player.play();
          }
        }}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          surfaceType="textureView"
        />
      </Pressable>

      <LinearGradient pointerEvents="none" colors={gradients.topFade} style={styles.topFade} />
      <LinearGradient pointerEvents="none" colors={gradients.bottomFade} style={styles.bottomFade} />

      {active && loading && !failed ? (
        <View pointerEvents="none" style={styles.center}>
          <ActivityIndicator color={colors.text} size="large" />
        </View>
      ) : null}

      {userPaused && !playing ? (
        <View pointerEvents="none" style={styles.center}>
          <View style={styles.bigPlay}>
            <Icon name="play" size={34} color={colors.text} />
          </View>
        </View>
      ) : null}

      {failed ? (
        <View style={styles.center}>
          <Text style={styles.failText}>Couldn&apos;t play this episode</Text>
          <Pressable
            onPress={() => {
              setFailed(false);
              player.replace(episode.videoUrl);
              player.play();
            }}
            style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      <View pointerEvents="box-none" style={[styles.overlay, { paddingBottom: bottomInset + 14 }]}>
        <View pointerEvents="box-none" style={styles.overlayRow}>
          <View pointerEvents="box-none" style={styles.info}>
            {info}
          </View>
          <ActionRail show={show} episode={episode} onEpisodes={onEpisodes} />
        </View>
        <Pressable
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
          onPress={(event) => {
            if (duration <= 0) return;
            const fromLeft = event.nativeEvent.locationX / trackWidth;
            const next = Math.max(0, Math.min(1, fromLeft)) * duration;
            seek(player, next);
            setPosition(next);
          }}
          hitSlop={{ top: 10, bottom: 10 }}
          style={styles.trackHit}>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${ratio * 100}%` }]} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function seek(target: VideoPlayer, time: number) {
  target.currentTime = time;
}

function setRate(target: VideoPlayer, rate: number) {
  target.playbackRate = rate;
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  bigPlay: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  failText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  retry: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.onAccent,
    fontWeight: '800',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
  },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  trackHit: {
    marginTop: 14,
    paddingVertical: 6,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
});
