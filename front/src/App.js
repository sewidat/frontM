import React, { useEffect, useState } from 'react';
import {BrowserRouter, Routes,Link, Route} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import { signout } from './actions/userActions';
import RegisterScreen from './screens/RegisterScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import SellerRoute from './components/SellerRoute';
import SellerScreen from './screens/SellerScreen';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import { listProductCategories } from './actions/productActions';
 import LoadingBox from './components/LoadingBox';
 import MessageBox from './components/MessageBox';

 function App() {
  const cart = useSelector(state => state.cart);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const {cartItems} = cart;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const dispatch = useDispatch();
  const signoutHandler = () => {
    dispatch(signout());
  };
  const productCategoryList = useSelector((state) => state.productCategoryList);
   const {
     loading: loadingCategories,
     error: errorCategories,
     categories,
   } = productCategoryList;
   useEffect(() => {
     dispatch(listProductCategories());
   }, [dispatch]);
  return ( 
    <BrowserRouter>
    <div className="grid-container">
      <header className="row">
        <div>
        <button
               type="button"
               className="open-sidebar"
               onClick={() => setSidebarIsOpen(true)}
             >
               <i className="fa fa-bars"></i>
             </button>
        <Link className="brand" to="/">
Palestine Shopping Website          </Link>
        </div>
        <div>
            <SearchBox />
          </div>
        <div>
        <Link to="/cart">
              Cart
              {cartItems.length > 0 && (
                <span className="badge">{cartItems.length}</span>
              )}
            </Link>
            {userInfo ? (
              <div className="dropdown">
                <Link to="#">
                  {userInfo.name} <i className="fa fa-caret-down"></i>{' '}
                </Link>
                <ul className="dropdown-content">
                  <li>
                    <Link to="/profile">User Profile</Link>
                  </li>
                
                  <li>
                     <Link to="/orderhistory">Order History</Link>
                   </li>
                  <li>
                    <Link to="#signout" onClick={signoutHandler}>
                      Sign Out
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/signin">Sign In</Link>
            )}
              {userInfo && userInfo.isSeller && (
               <div className="dropdown">
                 <Link to="#admin">
                   Seller <i className="fa fa-caret-down"></i>
                 </Link>
                 <ul className="dropdown-content">
                   <li>
                     <Link to="/productlist/seller">Products</Link>
                   </li>
                   <li>
                     <Link to="/orderlist/seller">Orders</Link>
                   </li>
                 </ul>
               </div>
             )}
             {userInfo && userInfo.isAdmin && (
               <div className="dropdown">
                 <Link to="#admin">
                   Admin <i className="fa fa-caret-down"></i>
                 </Link>
                 <ul className="dropdown-content">
                   <li>
                     <Link to="/dashboard">Dashboard</Link>
                   </li>
                   <li>
                     <Link to="/productlist">Products</Link>
                   </li>
                   <li>
                     <Link to="/orderlist">Orders</Link>
                   </li>
                   <li>
                     <Link to="/userlist">Users</Link>
                   </li>
                 </ul>
               </div>
             )}
                     </div>
        </header>
        <aside className={sidebarIsOpen ? 'open' : ''}>
           <ul className="categories">
             <li>
               <strong>Categories</strong>
               <button
                 onClick={() => setSidebarIsOpen(false)}
                 className="close-sidebar"
                 type="button"
               >
                 <i className="fa fa-close"></i>
               </button>
             </li>
             {loadingCategories ? (
               <LoadingBox></LoadingBox>
             ) : errorCategories ? (
               <MessageBox variant="danger">{errorCategories}</MessageBox>
             ) : (
               categories.map((c) => (
                 <li key={c}>
                   <Link
                     to={`/search/category/${c}`}
                     onClick={() => setSidebarIsOpen(false)}
                   >
                     {c}
                   </Link>
                 </li>
               ))
             )}
           </ul>
         </aside>
         <main>
           <Routes>
           <Route path="/seller/:id" element={<SellerScreen />}></Route>
           <Route path="/cart" element={<CartScreen />}></Route>
            <Route path="/cart/:id" element={<CartScreen />}></Route>
            <Route exact path="/" element={<HomeScreen/>}></Route>
           <Route path="/signin" element={<SigninScreen/>}></Route>
           <Route path="/register" element={<RegisterScreen/>}></Route>
           <Route path="/shipping" element={<ShippingAddressScreen/>}></Route>
           <Route path="/order/:id" element={<OrderScreen/>}></Route>
           <Route path="/userlist"element={ <AdminRoute><UserListScreen /> </AdminRoute>}/>
           <Route path="/user/:id/edit" element={ <AdminRoute><UserEditScreen /> </AdminRoute>}/>
           <Route exact path="/product/:id"element={<ProductScreen />}  ></Route>
           <Route path="/orderhistory" element={<OrderHistoryScreen/>}></Route>
           <Route path="/payment" element={<PaymentMethodScreen/>}></Route>
           <Route exact path="/product/:id/edit" element={<ProductEditScreen/>} ></Route>
           <Route path="/profile" element={  <PrivateRoute> <ProfileScreen /></PrivateRoute> }/>    
           <Route exact path="/productlist"  element={  <AdminRoute> <ProductListScreen/>  </AdminRoute> }/>
           <Route exact path="/orderlist" element={<AdminRoute> <OrderListScreen/> </AdminRoute> } />
           <Route path="/profile" element={<ProfileScreen/>}></Route>
           <Route path="/placeorder" element={<PlaceOrderScreen/>}></Route>
           <Route path="/profile"  element={ <PrivateRoute>  <ProfileScreen /> </PrivateRoute> }  />
           <Route path="/productlist/seller" element={<SellerRoute>  <ProductListScreen /> </SellerRoute> }/>
            <Route path="/orderlist/seller" element={<SellerRoute><OrderListScreen /></SellerRoute>}/>
            <Route exact path="/search/category/:category" element={<SearchScreen/>}/>
            <Route exact path="/search/category/:category/name/:name" element={<SearchScreen/>}/>
            <Route exact path="/search/category/:category/name/:name/min/:min/max/:max/rating/:rating/order/:order" element={<SearchScreen/>}/>
           {/* <Route exact path="/product/:id" render={(props) => <ProductScreen {...props} />} /> */}
           </Routes>
         </main>
         <footer className="row center">All right reserved For Adel,Lubna and Samer ^_^</footer>
       </div>
     </BrowserRouter>
   );
  }


 export default App;
