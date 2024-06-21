jest.mock("../api", () => {
    const mockSaveUser = jest.fn();
    const mockLoginUser = jest.fn();
    const mockGetUserById = jest.fn();
    const mockDeleteUser = jest.fn();
    const mockUpdateUser = jest.fn();
    const mockGetAllUsers = jest.fn();
    const mockSaveTrip = jest.fn();
    const mockUpdateTrip = jest.fn();
    const mockDeleteTrip = jest.fn();
    const mockGetTripById = jest.fn();

  
    return {
      saveUser: mockSaveUser,
      loginUser: mockLoginUser,
      getUserById: mockGetUserById,
      deleteUser: mockDeleteUser,
      updateUser: mockUpdateUser,
      getAllUsers: mockGetAllUsers,
      saveTrip: mockSaveTrip,
      updateTrip: mockUpdateTrip,
      deleteTrip: mockDeleteTrip,
      getTripById: mockGetTripById
    };
  });
  
  const {
    saveUser,
    loginUser,
    getUserById,
    deleteUser,
    updateUser,
    saveTrip,
    updateTrip,
    deleteTrip,
    getTripById
  } = require("../api");
  
  
  const mockUser = {
    _id: 1,
    first_name: "Michael",
    last_name: "Jordan",
    email: "michael@jordan.com",
    phone_number: 555555555,
    password: "password",
    role: "User",
  };

  const mockTrip = {
    _id: 1,
    destination: "Las Vegas",
    price: 999999,
    date: "2025-01-19T00:00:00.000Z",
    email: "admin@admin.pl"
  }
  
  describe("Test User API Functions", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("Save a user to DB and retrieve it by ID", async () => {
      await saveUser(mockUser);
      expect(saveUser).toHaveBeenCalledWith(mockUser);
  
      getUserById.mockResolvedValue([mockUser]);
  
      const getUser = await getUserById(mockUser.id);
      expect(getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(getUser[0]).toEqual(mockUser);
    });
  
    test("Log in the mock user", async () => {
      const { email, password } = mockUser;
      const expectedLoggedInUser = { ...mockUser };
  
      loginUser.mockResolvedValue(mockUser);
      const loggedInUser = await loginUser(email, password);
  
      expect(loginUser).toHaveBeenCalledWith(email, password);
  
      expect(loggedInUser).toEqual(expectedLoggedInUser);
    });
  
    test("Update the mock user", async () => {
      const updatedUser = { ...mockUser, first_name: "Jane", last_name: "Kot" };
      updateUser.mockResolvedValue(2);
      const result = await updateUser(mockUser.id, updatedUser);
      expect(updateUser).toHaveBeenCalledWith(mockUser.id, updatedUser);
      expect(result).toBe(2);
    });
  
    test("Delete the mock user", async () => {
      const userId = 1;
  
      deleteUser.mockResolvedValue(1);
  
      const result = await deleteUser(userId);
      expect(deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toBe(1);
    });
  });

  describe("Test Trip API Functions", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("Save a trip to DB and retrieve it by ID", async () => {
      await saveTrip(mockTrip);
      expect(saveTrip).toHaveBeenCalledWith(mockTrip);
  
      getTripById.mockResolvedValue([mockTrip]);
  
      const getTrip = await getTripById(mockTrip.id);
      expect(getTripById).toHaveBeenCalledWith(mockTrip.id);
      expect(getTrip[0]).toEqual(mockTrip);
    });
  
  
    test("Update the mock trip", async () => {
      const updatedTrip = { ...mockTrip, destination: "Gdynia" };
      updateTrip.mockResolvedValue(2);
      const result = await updateTrip(mockTrip.id, updatedTrip);
      expect(updateTrip).toHaveBeenCalledWith(mockTrip.id, updatedTrip);
      expect(result).toBe(2);
    });
  
    test("Delete the mock trip", async () => {
      const tripId = 1;
  
      deleteTrip.mockResolvedValue(1);
  
      const result = await deleteTrip(tripId);
      expect(deleteTrip).toHaveBeenCalledWith(tripId);
      expect(result).toBe(1);
    });
  });



