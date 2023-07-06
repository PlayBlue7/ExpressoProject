import Menu from '@/classes/Menu';
import MenuItem from '@/classes/MenuItem';
import Order from '@/classes/Order';
import AuthenticationService from '@/services/AuthenticationService';
import { Box, Card, Container, Grid, Stack, Text, Image, Overlay, Button, Title, Group, ActionIcon, ScrollArea, SegmentedControl, LoadingOverlay, Drawer, Dialog, Center, NumberInput, Alert, Transition, Popover, Loader } from '@mantine/core';
import { Check, InfoRounded } from '@mui/icons-material';
import axios from 'axios';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { database } from '../../../firebaseConfig';

const MenuPage = () => {
  const router = useRouter()
  const { restaurantUID, menuUID } = router.query
  let ruid = ""
  if (restaurantUID == undefined) return null;
  if (typeof restaurantUID != 'string')
    ruid = restaurantUID[0]
  else ruid = restaurantUID
  let muid = ""
  if (menuUID == undefined) return null;
  if (typeof menuUID != 'string')
    muid = menuUID[0]
  else muid = menuUID

  const restaurantRef = doc(database, "Restaurants", ruid);
  const storage = getStorage();

  const { user, getUser, setUser } = AuthenticationService.GetUserState();

  const [dataLoading, setDataLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [invalidUID, setInvalidUID] = useState(false);
  const [menu, setMenu] = useState<Menu>(new Menu(""));
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [basket, setBasket] = useState<{ dish: MenuItem, quantity: number }[]>([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [tableNo, setTableNo] = useState<number>();
  const [selectedSection, setSelectedSection] = useState<string>("");

  const getRecommendations = async () => {
    setRecommendationsLoading(true)
    await axios.post(
      'https://get-dish-recommendations-iqmeko4j4a-ew.a.run.app',
      {
        uuid: user?.uid ?? "", // has ordered some rainbow bowls but no chicken wings (vegetarian)
        // uuid: "65Wbvk64OPFQCTlKx0fd" // has ordered a lot of chicken wings
        // uuid: "" // has ordered garlic bread at another restaurant
        ruid: ruid,
        muid: muid,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
      .catch((error) => {
        console.log(error)
        setRecommendationsLoading(false)
      })
      .then(async (response) => { // response should be of type MenuItem[]
        if (response?.data != undefined) {
          let items = response?.data
          for (const item of items) {
            if (item.photo != "") {
              await getDownloadURL(ref(storage, item.photo))
                .then((url) => { item.photo = url })
                .catch((error) => console.log(error))
            }
          }
          setRecommendations(items)
          console.log(items)
        }
      })
    setRecommendationsLoading(false)
  }

  const getPhotos = async () => {
    let items = [{ 'name': 'Halloumi Sticks and Dip', 'description': 'Five chunky sticks of halloumi with our chilli jam', 'photo': '/MenuItemPhotos/620F8854-847E-47A3-81FE-4386E959080B.jpg', 'price': 4.5 }, { 'name': 'Rainbow Bowl', 'description': 'Warm spiced grains and long-stem broccoli with houmous.', 'photo': '/MenuItemPhotos/D048F061-2438-4E8A-9664-AE465EF94584.jpg', 'price': 9.25 }, { 'name': '10 Chicken Wings', 'description': 'Flame-grilled, infused with PERI-PERI.', 'photo': '/MenuItemPhotos/97C3E7F5-99D5-48D8-A0D3-D484E62B3258.jpg', 'price': 11.95 }, { 'name': 'Garlic Bread', 'description': 'Grilled for the perfect crunch!', 'photo': '/MenuItemPhotos/C5B77AFD-A4EB-4153-B22B-557167F20637.jpg', 'price': 3.5 }, { 'name': '5 Chicken Wings', 'description': 'Flame-grilled, infused with PERI-PERI.', 'photo': '/MenuItemPhotos/F3933D4D-87F8-4AA3-BC8F-F9F1D3BB285D.jpg', 'price': 6.95 }]
    for (const item of items) {
      console.log(item.photo)
      if (item.photo != "") {
        await getDownloadURL(ref(storage, item.photo))
          .then((url) => { item.photo = url; console.log(url) })
          .catch((error) => console.log(error))
      }
    }
    setRecommendations(items)
  }

  const getMenu = async () => {
    setDataLoading(true)
    const menuSnap = await getDoc(doc(database, "Menus", muid))
    if (menuSnap.exists()) {
      const { name, sections, activeTimes } = menuSnap.data();
      for (const section of sections) {
        for (const item of section.items) {
          if (item.photo != "") {
            await getDownloadURL(ref(storage, item.photo))
              .then((url) => { item.photo = url })
              .catch((error) => console.log(error))
          }
        }
      }
      let newMenu = new Menu(name, muid);
      newMenu.sections = sections
      setMenu(newMenu)
      setSelectedSection("0")
    }
    else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
      setInvalidUID(true)
    }
    setDataLoading(false)
  }

  const makeOrder = async () => {
    setOrderLoading(true)
    let newOrder: Order = { // does not include quantity
      price: parseFloat(basket.reduce((accumulator, item) => {
        return accumulator + (item.dish.price * item.quantity);
      }, 0).toFixed(2)),
      items: basket.map(item => item.dish),
      customerUID: user?.uid ?? "",
      // time: new Date(),
      restaurantUID: ruid,
      menuUID: muid,
      tableNumber: tableNo ?? 0,
      rating: [1, 1, 2, 3, 3, 4, 4, 5, 5, 5][Math.floor(Math.random() * 10)]
    }
    await addDoc(collection(database, "Orders"), newOrder).then(() => setOrderLoading(false));
  }

  useEffect(() => {
    getMenu();
  }, []);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    getPhotos();
  }, []);

  // useEffect(() => {
  //   if (user != undefined)
  //     getRecommendations();
  // }, [user]);

  return (
    <Box sx={{
      height: "85vh",
      width: "100vw",
      display: "flex",
      backgroundColor: 'white',
      flexDirection: "column",
      alignItems: 'center',
      alignContent: 'center',
      padding: 20
    }}>
      <LoadingOverlay visible={dataLoading} overlayOpacity={1} />
      <Drawer
        opened={basketOpen}
        position='bottom'
        onClose={() => setBasketOpen(false)}
        title="Basket"
        overlayProps={{ opacity: 0.5, blur: 4 }}
      >
        <Container>
          <Stack>
            {
              basket.map((item, index) => (
                <Card key={index} shadow="sm" withBorder>
                  <Grid grow>
                    <Grid.Col span={7} style={{ justifySelf: 'center' }}>
                      <Text fz="lg">{item.dish.name}</Text>
                      <Text color='gray'>
                        {"£" + (item.dish.price * item.quantity).toFixed(2)}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={4} style={{ alignSelf: 'center' }}>
                      <Group spacing={0}>
                        <ActionIcon size={32} variant="default" onClick={() => {
                          let newBasket = [...basket];
                          newBasket[index].quantity -= 1
                          if (newBasket[index].quantity == 0)
                            newBasket.splice(index, 1);
                          setBasket(newBasket)
                        }}>
                          –
                        </ActionIcon>
                        <Text style={{ margin: 10 }}>{item.quantity}</Text>
                        <ActionIcon size={32} variant="default" onClick={() => {
                          let newBasket = [...basket];
                          newBasket[index].quantity += 1
                          setBasket(newBasket)
                        }}>
                          +
                        </ActionIcon>
                      </Group>
                    </Grid.Col>
                  </Grid>
                </Card>
              ))
            }
          </Stack>
        </Container>
        <Stack style={{ paddingTop: 30 }}>
          <Group style={{ paddingBottom: 10 }}>
            <Title order={3}>Total: </Title>
            <Text>{"£" + basket.reduce((accumulator, item) => {
              return accumulator + (item.dish.price * item.quantity)
            }, 0).toFixed(2)}</Text>
          </Group>
          <Center style={{ alignItems: 'center', alignSelf: 'center', justifyContent: 'center', width: '80vw' }}>
            {basket.length > 0 ?
              <Container>
                <Stack>
                  <NumberInput
                    value={tableNo} onChange={(value) => { if (value != "") setTableNo(value) }}
                    placeholder="Table number"
                    label="Table number"
                    type='number'
                    hideControls
                  />
                  <Button
                    radius={10}
                    style={{ height: 50, alignSelf: 'center' }}
                    disabled={tableNo == undefined}
                    onClick={async () => {
                      setOrderLoading(true)
                      await makeOrder().then(() => {
                        setOrderLoading(false)
                        setBasket([])
                        setBasketOpen(false)
                        setAlertVisible(true)
                        setTimeout(() => {
                          setAlertVisible(false)
                        }, 2000);
                      })
                    }}
                    size={'xl'}
                  >
                    Place Order
                  </Button>
                </Stack>
              </Container>
              :
              <Title align='center'>No items in basket</Title>}
          </Center>
        </Stack>
      </Drawer>
      <Grid>
        {
          invalidUID ?
            (
              <Container style={{ color: 'white', alignItems: 'center', }}>
                <Title align='center' size='40'>Invalid Menu URL</Title>
                <Text align='center' size='xl'>Scan a QR code on your table to view the menus</Text>
              </Container>
            )
            :
            (
              <Stack style={{ padding: 10, paddingTop: 0 }}>
                {/* {user?.displayName != null && <Text align='center' size='xl'>{"Hi " + user?.displayName + "!" ?? ""}</Text>} */}
                <Title align='center'>{menu.name}</Title>
                <Group align={'c'} style={{ paddingLeft: 20, marginBottom: -10, paddingTop: 10 }}>
                  <Title align='left' order={4} style={{ marginRight: -5 }}>Recommended dishes for you</Title>
                  <Popover width={150} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <ActionIcon>
                        <InfoRounded />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm" align='center'>These recommendations are based on your previous order history</Text>
                    </Popover.Dropdown>
                  </Popover>
                </Group>
                <ScrollArea h={150} w='100vw' type='scroll' scrollbarSize={10} offsetScrollbars scrollHideDelay={100}>
                  {
                    recommendations.length == 0 ?
                      <Center w='100vw' h={150}>
                        <Loader></Loader>
                      </Center>
                      :
                      <Group noWrap h={100} style={{ marginTop: 10, marginLeft: 10, marginRight: 10 }} spacing={16}>
                        {
                          recommendations.map((item: MenuItem, index: number) => (
                            <Card key={index} shadow="sm" withBorder
                              style={{ width: '90vw' }}
                              onClick={() => {
                                let newBasket = [...basket]
                                let i = newBasket.findIndex(e => e.dish == item)
                                if (i > -1)
                                  newBasket[i].quantity += 1
                                else newBasket.push({ dish: item, quantity: 1 });
                                setBasket(newBasket);
                                setAdded(true)
                                setTimeout(() => {
                                  setAdded(false)
                                }, 2000);
                              }}
                            >
                              <Grid justify="center" align="center">
                                {basket.findIndex(e => e.dish == item) != -1 ?
                                  <Grid.Col span="content">
                                    <Text color="blue">{"x" + basket.find(e => e.dish == item)?.quantity}</Text>
                                  </Grid.Col>
                                  : null
                                }
                                <Grid.Col span="auto">
                                  <Text fz="lg">{item.name}</Text>
                                  <Text fz="md" color='gray'>{item.description}</Text>
                                  <Text color='gray'>{"£" + item.price + (item.price.toString().split(".")[1].length == 1 ? "0" : "")}</Text>
                                </Grid.Col>
                                <Grid.Col span="content">
                                  {
                                    item.photo != "" ?
                                      <Image
                                        src={item.photo}
                                        fit='cover'
                                        height="10vh"
                                        width="10vh"
                                        radius={6}
                                        withPlaceholder
                                      />
                                      : null
                                  }
                                </Grid.Col>
                              </Grid>
                            </Card>
                          ))
                        }
                      </Group>
                  }
                </ScrollArea>
                <Stack style={{ padding: 10, marginBottom: 20 }}>
                  <ScrollArea h={50} w='90vw' type='scroll' scrollbarSize={5} offsetScrollbars scrollHideDelay={100}>
                    <SegmentedControl
                      value={selectedSection}
                      onChange={setSelectedSection}
                      transitionDuration={300}
                      transitionTimingFunction="cubic-bezier(0.1, 0.7, 1, 0.1)"
                      style={{ alignSelf: 'center' }}
                      data={
                        menu.sections.map((section: { name: string }, index) => ({ label: section.name, value: index.toString() }))
                      }
                    />
                  </ScrollArea>
                  {
                    menu.sections?.at(parseInt(selectedSection))?.items.map((item: { name: string, photo: string, price: number, description: string }, index: number) => (
                      <Card key={index} shadow="sm" withBorder
                        onClick={() => {
                          let newBasket = [...basket]
                          let i = newBasket.findIndex(e => e.dish == item)
                          if (i > -1)
                            newBasket[i].quantity += 1
                          else newBasket.push({ dish: item, quantity: 1 });
                          setBasket(newBasket);
                          setAdded(true)
                          setTimeout(() => {
                            setAdded(false)
                          }, 2000);
                        }}
                      >
                        <Grid justify="center" align="center">
                          {basket.findIndex(e => e.dish == item) != -1 ?
                            <Grid.Col span="content">
                              <Text color="blue">{"x" + basket.find(e => e.dish == item)?.quantity}</Text>
                            </Grid.Col>
                            : null
                          }
                          <Grid.Col span="auto">
                            <Text fz="lg">{item.name}</Text>
                            <Text fz="md" color='gray'>{item.description}</Text>
                            <Text color='gray'>{"£" + item.price + (item.price.toString().split(".")[1].length == 1 ? "0" : "")}</Text>
                          </Grid.Col>
                          <Grid.Col span="content">
                            {
                              item.photo != "" ?
                                <Image
                                  src={item.photo}
                                  fit='cover'
                                  height="10vh"
                                  width="10vh"
                                  radius={6}
                                  withPlaceholder
                                />
                                : null
                            }
                          </Grid.Col>
                        </Grid>
                      </Card>
                    ))
                  }
                </Stack>
              </Stack>
            )
        }
      </Grid>
      <Transition mounted={alertVisible} transition="fade" duration={400} timingFunction="ease">
        {(styles) => (
          <Overlay opacity={0.2} style={styles}>
            <Center style={{ height: '100vh' }}>
              <Alert icon={<Check />} title="Order Placed!" color="teal">
                Successfully placed order!
              </Alert>
            </Center>
          </Overlay>
        )}
      </Transition>
      <Button radius={0} style={{ position: 'absolute', bottom: 0, width: '100vw', height: 50 }}
        onClick={() => setBasketOpen(true)}
      >
        Basket ({basket.reduce((accumulator, dish) => {
          return accumulator + dish.quantity;
        }, 0)})
      </Button>
      <Dialog position={{ bottom: 10 }}
        opened={added}
        onClose={() => setAdded(false)}
        size="md" radius="md"
        style={{ width: '90vw', backgroundColor: '#333333', marginLeft: '5vw', marginRight: '5vw' }}
      >
        <Text size="sm" weight={500} color='white'>
          Item added to basket!
        </Text>
      </Dialog>
    </Box>
  )
}

export default MenuPage