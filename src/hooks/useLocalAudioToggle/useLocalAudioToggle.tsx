import { LocalAudioTrack } from 'twilio-video';
import { useCallback, useState } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useLocalAudioToggle() {
  const { room, localTracks, getLocalAudioTrack, removeLocalAudioTrack, onError } = useVideoContext();

  const localParticipant = room?.localParticipant;
  const audioTrack = localTracks.find(track => track.kind === 'audio') as LocalAudioTrack;
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleAudioEnabled = useCallback(() => {
    if (!isPublishing) {
      if (audioTrack) {
        const localTrackPublication = localParticipant?.unpublishTrack(audioTrack);
        // Workaround: Emit manually until SDK emits 'trackUnpublished'
        localParticipant?.emit('trackUnpublished', localTrackPublication);
        removeLocalAudioTrack();
      } else {
        setIsPublishing(true);
        getLocalAudioTrack()
          .then((track: LocalAudioTrack) => {
            return localParticipant?.publishTrack(track);
          })
          .catch(onError)
          .finally(() => {
            setIsPublishing(false);
          });
      }
    }
  }, [audioTrack, localParticipant, getLocalAudioTrack, isPublishing, onError, removeLocalAudioTrack]);

  return [!!audioTrack, toggleAudioEnabled] as const;
}
