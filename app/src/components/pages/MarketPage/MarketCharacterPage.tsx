import React from 'react';
import {
  ICharacter,
  getCharacterPath,
  getPurchasePath,
  Creatable,
  IPurchase,
} from 'infinitris2-models';
import { useDocument } from 'swr-firestore';
import { Page } from '../../ui/Page';
import { useParams } from 'react-router-dom';
import { LargeCharacterTile } from './CharacterPageTile';
import { useUser } from '@/components/hooks/useUser';
import FlexBox from '@/components/ui/FlexBox';
import { zIndexes } from '@/theme/theme';
import { Carousel } from '@/components/ui/Carousel';
import { BlockPreview } from './BlockPreview';
import { FormattedMessage, useIntl } from 'react-intl';
import { DEFAULT_CHARACTER_IDs, LocalUser } from '@/state/LocalUserStore';
import { toast } from 'react-toastify';
import {
  purchaseFreeCharacter,
  setSelectedCharacterId,
} from '@/state/updateUser';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import useAuthStore from '@/state/AuthStore';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CharacterHabitatBackground } from '@/components/ui/CharacterHabitatBackground';
import { CharacterCoinStatChip } from '@/components/pages/Characters/CharacterStatChip';

export default function MarketPage() {
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { id } = useParams<{ id: string }>();
  const { data: character } = useDocument<ICharacter>(getCharacterPath(id));
  const intl = useIntl();
  const user = useUser();
  const [isLoading, setIsLoading] = React.useState(false);

  const pages: React.ReactNode[] = character
    ? [
        <LargeCharacterTile key="1" character={character} />,
        <BlockPreview key="2" character={character} />,
      ]
    : [];

  return (
    <Page
      title={character ? `${character?.data()?.name}` : undefined}
      whiteTitle
      background={<CharacterHabitatBackground character={character} />}
    >
      <FlexBox zIndex={zIndexes.above}>
        {isLoading && <LoadingSpinner />}
        {character &&
          !isLoading &&
          ((!authStoreUserId &&
            ((user as LocalUser).freeCharacterIds?.indexOf(id) ?? -1)) < 0 ||
            (authStoreUserId &&
              (user.readOnly?.characterIds?.indexOf(id) ?? -1) < 0)) && (
            <Button
              autoFocus
              color="primary"
              variant="contained"
              disabled={
                (character.data()?.maxPurchases || -1) -
                  (character.data()?.numPurchases || 0) ===
                0
              }
              sx={{ mb: 2 }}
              onClick={async () => {
                setIsLoading(true);
                let purchaseSucceeded = false;
                if (character.data()!.price <= (user.readOnly?.coins || 0)) {
                  if (authStoreUserId) {
                    const purchase: Creatable<IPurchase> = {
                      created: false,
                      entityCollectionPath: 'characters',
                      entityId: character.id,
                      userId: authStoreUserId,
                    };
                    try {
                      await setDoc(
                        doc(
                          getFirestore(),
                          getPurchasePath(
                            'characters',
                            character.id,
                            authStoreUserId
                          )
                        ),
                        purchase
                      );
                      purchaseSucceeded = true;
                    } catch (error) {
                      console.error('Failed to purchase character', error);
                    }
                  } else {
                    purchaseFreeCharacter(
                      (user as LocalUser).freeCharacterIds ||
                        DEFAULT_CHARACTER_IDs,
                      id
                    );
                    purchaseSucceeded = true;
                  }
                  if (purchaseSucceeded) {
                    setSelectedCharacterId(id);
                    toast(
                      intl.formatMessage({
                        defaultMessage: 'Character Purchased',
                        description: 'Character Purchased toast message',
                      })
                    );
                  }
                } else {
                  toast(
                    intl.formatMessage({
                      defaultMessage: 'Not enough coins',
                      description: 'Not enough coins toast message',
                    }),
                    {}
                  );
                }
                setIsLoading(false);
              }}
            >
              <FormattedMessage
                defaultMessage="Buy"
                description="Character page - buy button"
              />
            </Button>
          )}
        {character && (character.data()?.maxPurchases || -1) >= 0 && (
          <Typography variant="caption" color="secondary">
            <FormattedMessage
              defaultMessage="{numRemaining} remaining"
              description="number of stock remaining for purchase"
              values={{
                numRemaining:
                  character.data()!.maxPurchases -
                  (character.data()!.numPurchases || 0),
              }}
            />
          </Typography>
        )}
        {character && (
          <FlexBox position="relative">
            <Carousel slides={pages} />
            <FlexBox position="absolute" bottom={40}>
              <CharacterCoinStatChip value={character?.data()!.price} />
            </FlexBox>
          </FlexBox>
        )}

        {/*<FlexBox
        top={0}
        left={0}
        padding={2}
        gap={1}
        flexDirection="row"
        style={{
          position: 'absolute',
        }}
      >
        <SvgIcon fontSize="large">
          <CoinIcon />
        </SvgIcon>
        <Typography
          variant="h4"
          style={{ color: colors.white, fontWeight: 700, marginTop: '3px' }}
        >
          {user.readOnly.coins || 0}
        </Typography>
      </FlexBox>*/}
      </FlexBox>
    </Page>
  );
}
