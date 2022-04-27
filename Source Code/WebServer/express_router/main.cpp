#include <iostream>
#include <sstream>
#include <restinio/all.hpp>
#include <json_dto/pub.hpp>
using namespace std;

template <typename T>
std::string to_string_with_precision(const T a_value, const int n = 6)
{
    std::ostringstream out;
    out.precision(n);
    out << std::fixed << a_value;
    return out.str();
}

struct place_t
{
	place_t() = default;

	place_t( string placename, double lat, double lon )
		:	m_placename{ 	std::move( placename ) }
		,	m_lat{ 			std::move( lat )}
		,	m_lon{ 			std::move( lon )}
	{}

	template< typename JSON_IO >
	void
	json_io( JSON_IO & io )
	{
		io
			& json_dto::mandatory( "placename", m_placename )
			& json_dto::mandatory( "lat", m_lat )
			& json_dto::mandatory( "lon", m_lon );
	}

	string m_placename;
	double m_lat;
	double m_lon;
};

struct weatherRegistration_t
{
	weatherRegistration_t() = default;

	weatherRegistration_t(int id, int date, string time, place_t place, double temperature, int humidity )
		:	m_id{ 			std::move(id)},
			m_date{ 		std::move(date)},
			m_time{ 		std::move(time)},
			m_place{ 		std::move(place)},
			m_temperature{ 	std::move(temperature)},
			m_humidity{ 	std::move(humidity)}
	{}

	template<typename JSON_IO>
	void json_io( JSON_IO & io )
	{
		io
			& json_dto::mandatory( "id", m_id )
			& json_dto::mandatory( "date", m_date )
			& json_dto::mandatory( "time", m_time )
			& json_dto::mandatory( "place", m_place )
			& json_dto::mandatory( "temperature", m_temperature )
			& json_dto::mandatory( "humidity", m_humidity );
	}

	int m_id;
	int m_date;
	string m_time;
	place_t m_place;
	double m_temperature;
	int m_humidity;
};

using weather_collection_t = std::vector< weatherRegistration_t >;

namespace rr = restinio::router;
using router_t = rr::express_router_t<>;

class weather_handler_t
{
public :
	explicit weather_handler_t( weather_collection_t & weather )
		:	m_weather( weather )
	{}

	weather_handler_t( const weather_handler_t & ) = delete;
	weather_handler_t( weather_handler_t && ) = delete;

	auto on_weather_list( const restinio::request_handle_t& req, rr::route_params_t ) const
	{
		auto resp = init_resp( req->create_response() );
		resp.append_header( restinio::http_field::content_type, "text/html; charset=utf-8" );

		string num = "123";

		resp.set_body(
			"<html>\r\n"
			"	<head>\r\n"
			"	</head>\r\n"
			"	<body>\r\n"
			"		<button onclick=\"location.href='/html'\" type=\"button\">Will i work?</button>\r\n"
			"		<script>\r\n"
			"		function myFunction() {\r\n"
			"			location.href = \"https://www.w3schools.com\";\r\n"
			"		}\r\n"
			"		</script>\r\n"
			"	</body>\r\n"
			"</html>\r\n"
		);

		return resp.done();
	}

	auto on_weather_list_html( const restinio::request_handle_t& req, rr::route_params_t ) const
	{
		auto resp = init_resp( req->create_response() );
		resp.append_header( restinio::http_field::content_type, "text/html; charset=utf-8" );

		string num = "123";

		resp.set_body(
			"<html>\r\n"
			"	<head>\r\n"
			"	</head>\r\n"
			"	<body>\r\n"
			"		<img id='barcode' src=\"https://api.qrserver.com/v1/create-qr-code/?data=" + num + "&amp;size=100x100\" alt=\"Fail?\" title=\"HELLO\" width=\"50\" height=\"50\" />\r\n"
			"	</body>\r\n"
			"</html>\r\n"
		);

		return resp.done();
	}

private :
	weather_collection_t & m_weather;

	template < typename RESP >
	static RESP
	init_resp( RESP resp )
	{
		resp
			.append_header( "Server", "RESTinio sample server /v.0.6" )
			.append_header_date_field();

		return resp;
	}

	template < typename RESP >
	static void
	mark_as_bad_request( RESP & resp )
	{
		resp.header().status_line( restinio::status_bad_request() );
	}
};

auto server_handler( weather_collection_t & weather_collection )
{
	auto router = std::make_unique< router_t >();
	auto handler = std::make_shared< weather_handler_t >( std::ref(weather_collection) );

	auto by = [&]( auto method ) {
		using namespace std::placeholders;
		return std::bind( method, handler, _1, _2 );
	};

	auto method_not_allowed = []( const auto & req, auto ) {
			return req->create_response( restinio::status_method_not_allowed() )
					.connection_close()
					.done();
		};

	// Handlers for '/' path.
	router->http_get( "/", by( &weather_handler_t::on_weather_list ) );
	router->http_get( "/html", by( &weather_handler_t::on_weather_list_html ) );
	
	// Disable all other methods for '/'.
	router->add_handler( restinio::router::none_of_methods( restinio::http_method_get(),
	restinio::http_method_post() ), "/", method_not_allowed );

	return router;
}

int main()
{
	using namespace std::chrono;

	try
	{
		using traits_t =
			restinio::traits_t<
				restinio::asio_timer_manager_t,
				restinio::single_threaded_ostream_logger_t,
				router_t >;

		place_t place[] = {{"Aarhus N", 56.172725, 10.192146}};

		weather_collection_t weather_collection {
			{ 1, 20220425, "05:15", place[0], 13.1, 70 }
		};

		restinio::run(
			restinio::on_this_thread< traits_t >()
				.address( "localhost" )
				.request_handler( server_handler( weather_collection ) )
				.read_next_http_message_timelimit( 10s )
				.write_http_response_timelimit( 1s )
				.handle_request_timeout( 1s ) );
	}
	catch( const std::exception & ex )
	{
		std::cerr << "Error: " << ex.what() << std::endl;
		return 1;
	}

	return 0;
}