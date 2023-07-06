import AuthenticationService from '@/services/AuthenticationService';
import { Box, Card, Container, Grid, Stack, Text, Image, Overlay, Button, Title, Group, ActionIcon, LoadingOverlay } from '@mantine/core';
import { AccountCircle, ChevronRight, Google } from '@mui/icons-material';
import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Link from 'next/link';
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { database } from '../../../firebaseConfig';

const Welcome = () => {
  const router = useRouter()
  const { restaurantUID } = router.query

  // const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  let uid = ""
  if (restaurantUID == undefined) return null;
  if (typeof restaurantUID != 'string')
    uid = restaurantUID[0]
  else uid = restaurantUID

  const restaurantRef = doc(database, "Restaurants", uid);
  const storage = getStorage();

  const { user, getUser } = AuthenticationService.GetUserState();

  const [dataLoading, setDataLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [backgroundURL, setBackgroundURL] = useState("");
  const [invalidUID, setInvalidUID] = useState(false);
  const [menus, setMenus] = useState<{ name: string, uid: string }[]>([]);

  const getRestaurant = async () => {
    setDataLoading(true)
    const docSnap = await getDoc(restaurantRef);

    if (docSnap.exists()) {
      const { name, coverPhoto, googlePhotoRef, menuUIDs } = docSnap.data();
      console.log(googlePhotoRef)
      setRestaurantName(name)
      let menus: { name: string, uid: string }[] = []
      for (const menuUID of menuUIDs) {
        let menuSnap = await getDoc(doc(database, "Menus", menuUID))
        if (menuSnap.exists()) {
          const { name } = menuSnap.data();
          menus.push({ name: name, uid: menuUID })
        }
      }
      setMenus(menus)
      if (coverPhoto != "")
        getDownloadURL(ref(storage, docSnap.data().coverPhoto))
          .then((url) => { setBackgroundURL(url) })
          .catch((error) => console.log(error))
      else setBackgroundURL("https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photo_reference=" + googlePhotoRef + "&key=AIzaSyA_jV-IKP3PDPwZ2t1ojOHPFHCiiCAOvw8")
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
      setInvalidUID(true)
      setBackgroundURL("https://cdn-media-2.freecodecamp.org/w1280/5f9c9cfc740569d1a4ca3543.jpg")
    }
    setDataLoading(false)
  }

  useEffect(() => {
    getRestaurant();
  }, []);

  useEffect(() => {
    getUser();
  }, []);

  // useEffect(() => {
  //   // Updating a state causes a re-render
  //   setInitialRenderComplete(true);
  // }, []);

  return (
    <>
      <Box sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image
          src={backgroundURL} fit='cover' height="100vh" width="100vw" withPlaceholder />
        <Overlay blur={5} center style={{ height: "100vh" }}>
          {
            user != undefined ?
              <Button
                style={{ position: 'absolute', top: 40, right: 20 }}
                onClick={async () => await AuthenticationService.SignOut()}>Log out</Button>
              : null
          }
          <LoadingOverlay visible={dataLoading} transitionDuration={500} overlayOpacity={1} />
          <Grid style={{
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            width: "90vw"
          }} >
            <Grid>
              {
                invalidUID ?
                  (
                    <Container style={{ color: 'white', alignItems: 'center' }}>
                      <Title align='center' size='40' display='flex'>Invalid Restaurant URL</Title>
                      <Text align='center' size='xl'>Scan a QR code on your table to view the menus</Text>
                    </Container>
                  )
                  :
                  (
                    <Stack spacing={0} style={{ color: 'white', alignItems: 'center' }}>
                      <Title align='center' size='50' display='flex'>Welcome to</Title>
                      <Title align='center' size='40' display='flex' truncate>{restaurantName ?? ""}</Title>
                      {
                        user != undefined || isGuest ?
                        (
                          <Container style={{marginTop:20}}>
                              { user?.displayName != null && <Text align='center' size='xl' truncate>{"Hi " + user?.displayName + "!" ?? ""}</Text>}
                              <Text align='center' size='xl' style={{ marginBottom: 20 }}>Select from today's available menus</Text>
                              {
                                menus.map((menu, index) => (
                                  <Link href={`${uid}/${menu.uid}`}>
                                    <Card key={index} style={{ margin: 8, flexDirection: 'row' }}>
                                      <Group spacing={4}>
                                        <Text style={{ fontSize: 20, flexGrow: 1 }} color="text.secondary">
                                          {menu.name}
                                        </Text>
                                        <ActionIcon variant="transparent" disabled><ChevronRight /></ActionIcon>
                                      </Group>
                                    </Card>
                                  </Link>
                                ))
                              }
                            </Container>
                          )
                          :
                          (
                            <Stack style={{ marginTop: 30, padding:10}}>
                              <Text align='center' size='lg' style={{ marginBottom: 20, padding:10 }}>
                                Log in with Google to get dish recommendations based on your previous order history!
                              </Text>
                              <Button
                                leftIcon={<Google fontSize='small' />}
                                onClick={async () => await AuthenticationService.SignInWithGoogle()}>Log in with Google</Button>
                              <Button
                                leftIcon={<AccountCircle fontSize='small' />}
                                onClick={() => setIsGuest(true)}>Continue as Guest</Button>
                            </Stack>
                          )
                      }

                    </Stack>
                  )
              }
            </Grid>
          </Grid>
        </Overlay>
      </Box>
    </>
  )
}

export default Welcome